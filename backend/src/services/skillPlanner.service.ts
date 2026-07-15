import { HttpException } from "../exceptions/http-exceptions";
import { IJobRole } from "../models/jobRole.model";
import { UserProgressService } from "./userProgress.service";
import { UserMongoRepository } from "../repository/user.repository";
import { SubjectMongoRepository } from "../repository/subject.repository";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import { ResumeAnalysisMongoRepository } from "../repository/resumeAnalysis.repository";
import { ProjectMongoRepository } from "../repository/project.repository";
import { PracticeAttemptMongoRepository } from "../repository/practiceAttempt.repository";
import { extractRequiredSkills, getReadinessLabel } from "../lib/readiness";
import {
  SkillPlannerDto,
  SkillPlannerRoleDto,
  SkillPlannerSkillDto,
  SkillSourceTag,
  SkillStatus,
} from "../dtos/skillPlanner.dto";

const userProgressService = new UserProgressService();
const userRepository = new UserMongoRepository();
const subjectRepository = new SubjectMongoRepository();
const careerKnowledgeRepository = new CareerKnowledgeMongoRepository();
const resumeAnalysisRepository = new ResumeAnalysisMongoRepository();
const projectRepository = new ProjectMongoRepository();
const practiceAttemptRepository = new PracticeAttemptMongoRepository();

// Same 70-point bar the readiness labels already treat as "Above
// Average"/"Interview Ready" territory (lib/readiness.ts) -- reused here so
// a skill's own interview-readiness bar means the same thing as the
// role-level one.
const INTERVIEW_READY_SCORE = 70;

// This is an internal aggregation read, not a user-facing paginated list --
// a generous cap so we effectively fetch "all" without an unbounded query.
const PRACTICE_ATTEMPT_LIMIT = 100;
const PROJECT_LIMIT = 200;

// Purely a display heuristic for the proficiency bar when no real practice
// score exists for a skill yet -- never used for readiness math (that stays
// exclusively required-vs-acquired via lib/readiness.ts).
const PROFICIENCY_BY_STATUS: Record<SkillStatus, number> = {
  Locked: 0,
  Upcoming: 15,
  Learning: 45,
  Practiced: 30,
  ProjectApplied: 65,
  InterviewReady: 80,
  Mastered: 95,
};

// Display ordering: skills with real signal to act on (already being
// learned, practiced, applied, or nearly there) surface first: Locked
// skills carry zero information yet, so they're not "urgent," just
// unstarted -- sorting purely by gap % would otherwise push every
// no-data skill above ones the user is actively making progress on.
// Mastered goes last since there's nothing left to do.
const STATUS_DISPLAY_PRIORITY: Record<SkillStatus, number> = {
  Learning: 1,
  Practiced: 2,
  ProjectApplied: 3,
  InterviewReady: 4,
  Upcoming: 5,
  Locked: 6,
  Mastered: 7,
};

export class SkillPlannerService {
  // Pure aggregator: reads UserProgress, CareerKnowledge, Subject,
  // ResumeAnalysis, Project and PracticeAttempt and composes a per-skill
  // view. Never writes to any collection.
  async getSkillPlanner(userId: string, jobRoleId: string): Promise<SkillPlannerDto> {
    // Same self-healing call dashboard.service.ts already relies on, so the
    // planner never shows stale readiness/missingSkills either.
    const progress = await userProgressService.checkForKnowledgeUpdates(userId);

    const role = progress.targetRoleProgress.find(
      (r) => (r.jobRoleId as any)._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found in your target roles");
    }

    const jobRole = role.jobRoleId as unknown as IJobRole;
    const roleDto: SkillPlannerRoleDto = {
      jobRoleId,
      jobRole: jobRole.title,
      category: jobRole.category,
    };

    const knowledge = await careerKnowledgeRepository.findByJobRoleId(jobRoleId);

    if (!knowledge) {
      return this.emptyPlanner(roleDto, role);
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const [subjects, resumeAnalysis, projectsResult, attemptsResult] = await Promise.all([
      user.courseId ? subjectRepository.findByCourse(user.courseId.toString()) : Promise.resolve([]),
      resumeAnalysisRepository.findLatestByUser(userId),
      projectRepository.getAllPaginated(1, PROJECT_LIMIT, { careerRole: jobRoleId }),
      practiceAttemptRepository.getAllByUserPaginated(userId, 1, PRACTICE_ATTEMPT_LIMIT, {
        jobRoleId,
      }),
    ]);

    const requiredSkills = extractRequiredSkills(knowledge);

    // --- lookup maps, one pass each, reused per required skill below ---

    const minSemesterBySkill = new Map<string, number>();
    for (const subject of subjects) {
      for (const raw of subject.skills) {
        const skill = raw.toLowerCase();
        const current = minSemesterBySkill.get(skill);
        if (current === undefined || subject.semester < current) {
          minSemesterBySkill.set(skill, subject.semester);
        }
      }
    }

    const resumeSkillSet = new Set(
      (resumeAnalysis?.skills ?? []).map((s) => s.toLowerCase()),
    );

    const completedProjectTitles = new Set(
      role.completedProjects.map((p) => p.projectTitle.toLowerCase()),
    );
    const projectSkillMap = new Map<string, string[]>();
    for (const project of projectsResult.data) {
      if (!completedProjectTitles.has(project.title.toLowerCase())) {
        continue;
      }
      for (const raw of project.skills) {
        const skill = raw.toLowerCase();
        projectSkillMap.set(skill, [...(projectSkillMap.get(skill) ?? []), project.title]);
      }
    }

    const practiceBySkill = new Map<string, { bestScore: number; attemptIds: Set<string> }>();
    for (const attempt of attemptsResult.data) {
      for (const q of attempt.questions) {
        const answered = !!q.userAnswer || !!q.userCode;
        if (!answered) {
          continue;
        }
        for (const raw of q.skills ?? []) {
          const skill = raw.toLowerCase();
          const entry = practiceBySkill.get(skill) ?? {
            bestScore: 0,
            attemptIds: new Set<string>(),
          };
          entry.bestScore = Math.max(entry.bestScore, q.score ?? 0);
          entry.attemptIds.add(attempt._id.toString());
          practiceBySkill.set(skill, entry);
        }
      }
    }

    const resourcesBySkill = new Map<string, SkillPlannerDto["resources"]>();
    for (const resource of knowledge.learningResources) {
      for (const raw of resource.skills ?? []) {
        const skill = raw.toLowerCase();
        const entry = resourcesBySkill.get(skill) ?? [];
        entry.push({ title: resource.title, type: resource.type, url: resource.url, skills: resource.skills });
        resourcesBySkill.set(skill, entry);
      }
    }

    const displayNameBySkill = new Map<string, string>();
    const rememberDisplayName = (s: string) => {
      const key = s.toLowerCase();
      if (!displayNameBySkill.has(key)) {
        displayNameBySkill.set(key, s);
      }
    };
    knowledge.requiredSkills.forEach(rememberDisplayName);
    knowledge.roadmap.forEach((step) => step.requiredSkills.forEach(rememberDisplayName));

    const skills: SkillPlannerSkillDto[] = requiredSkills
      .map((skill) => {
        const minSemester = minSemesterBySkill.get(skill) ?? null;
        const isTaughtByCourse = minSemester !== null;
        const isTaughtPast = isTaughtByCourse && (minSemester as number) <= progress.currentSemester;
        const isTaughtFuture = isTaughtByCourse && !isTaughtPast;
        const hasResumeEvidence = resumeSkillSet.has(skill);
        const projectTitles = projectSkillMap.get(skill) ?? [];
        const hasProjectEvidence = projectTitles.length > 0;
        const practiceEntry = practiceBySkill.get(skill);
        const hasPracticeEvidence = !!practiceEntry;
        const bestScore = practiceEntry?.bestScore ?? null;
        const isInterviewReady = hasPracticeEvidence && (bestScore as number) >= INTERVIEW_READY_SCORE;

        // Precedence: best signal wins. A skill only "graduates" to Mastered
        // once it has interview, project AND (curriculum or resume) backing
        // all at once -- otherwise it settles on whichever single strongest
        // signal it has.
        let status: SkillStatus;
        if (isInterviewReady && hasProjectEvidence && (isTaughtPast || hasResumeEvidence)) {
          status = "Mastered";
        } else if (isInterviewReady) {
          status = "InterviewReady";
        } else if (hasProjectEvidence) {
          status = "ProjectApplied";
        } else if (hasPracticeEvidence) {
          status = "Practiced";
        } else if (isTaughtPast || hasResumeEvidence) {
          status = "Learning";
        } else if (isTaughtFuture) {
          status = "Upcoming";
        } else {
          status = "Locked";
        }

        const sources: SkillSourceTag[] = [
          ...(isTaughtPast ? (["curriculum"] as const) : []),
          ...(hasResumeEvidence ? (["resume"] as const) : []),
          ...(hasProjectEvidence ? (["project"] as const) : []),
          ...(hasPracticeEvidence ? (["practice"] as const) : []),
        ];

        // Prefer the real evaluated score when one exists (most objective
        // signal available); otherwise fall back to a status-banded
        // estimate purely for the visual proficiency bar.
        const proficiency = hasPracticeEvidence ? (bestScore as number) : PROFICIENCY_BY_STATUS[status];
        const gapPercent = 100 - proficiency;

        return {
          skill,
          displayName: displayNameBySkill.get(skill) ?? skill,
          status,
          proficiency,
          gapPercent,
          gapSeverity: (proficiency < 50 ? "high" : "low") as "low" | "high",
          sources,
          curriculum: { taught: isTaughtByCourse, semester: minSemester, isPast: isTaughtPast },
          practice: {
            attempted: hasPracticeEvidence,
            bestScore,
            attemptCount: practiceEntry?.attemptIds.size ?? 0,
          },
          project: { applied: hasProjectEvidence, projectTitles },
          resources: resourcesBySkill.get(skill) ?? [],
        };
      })
      .sort(
        (a, b) =>
          STATUS_DISPLAY_PRIORITY[a.status] - STATUS_DISPLAY_PRIORITY[b.status] ||
          b.gapPercent - a.gapPercent,
      );

    const coveredByDegree = skills.filter((s) => s.curriculum.taught).map((s) => s.skill);
    const notCoveredByDegree = skills.filter((s) => !s.curriculum.taught).map((s) => s.skill);

    const roadmapProgress = await userProgressService.getRoadmapProgress(userId, jobRoleId);

    const completedStepOrders = new Set(role.completedRoadmapSteps.map((s) => s.stepOrder));
    let cumulativeWeeks = 0;
    let currentAssigned = false;
    const roadmap = [...knowledge.roadmap]
      .sort((a, b) => a.order - b.order)
      .map((step) => {
        const startWeek = cumulativeWeeks + 1;
        cumulativeWeeks += step.estimatedWeeks;
        const done = completedStepOrders.has(step.order);
        let status: "done" | "current" | "locked";
        if (done) {
          status = "done";
        } else if (!currentAssigned) {
          status = "current";
          currentAssigned = true;
        } else {
          status = "locked";
        }
        const completedEntry = role.completedRoadmapSteps.find((s) => s.stepOrder === step.order);

        return {
          order: step.order,
          title: step.title,
          description: step.description,
          estimatedWeeks: step.estimatedWeeks,
          startWeek,
          requiredSkills: step.requiredSkills,
          completionCriteria: step.completionCriteria,
          resources: step.resources,
          status,
          completedAt: completedEntry?.completedAt ?? null,
        };
      });

    return {
      role: roleDto,
      hasCareerKnowledge: true,
      readinessScore: role.readinessScore,
      readinessLabel: getReadinessLabel(role.readinessScore),
      requiredSkillsCount: requiredSkills.length,
      matchedSkillsCount: requiredSkills.length - role.missingSkills.length,
      skills,
      degreeVsMarket: {
        curriculumCoverage: requiredSkills.length
          ? Math.round((coveredByDegree.length / requiredSkills.length) * 100)
          : 0,
        coveredByDegree,
        notCoveredByDegree,
      },
      roadmap,
      roadmapProgress,
      resources: knowledge.learningResources.map((r) => ({
        title: r.title,
        type: r.type,
        url: r.url,
        skills: r.skills,
      })),
      market: {
        salary: knowledge.salary,
        marketTrend: knowledge.marketTrend?.trend ?? null,
        futureDemand: knowledge.futureDemand,
        difficulty: knowledge.difficulty,
      },
      lastVisited: role.lastVisited,
    };
  }

  private emptyPlanner(
    roleDto: SkillPlannerRoleDto,
    role: { readinessScore: number; lastVisited: Date | null },
  ): SkillPlannerDto {
    return {
      role: roleDto,
      hasCareerKnowledge: false,
      readinessScore: role.readinessScore,
      readinessLabel: getReadinessLabel(role.readinessScore),
      requiredSkillsCount: 0,
      matchedSkillsCount: 0,
      skills: [],
      degreeVsMarket: { curriculumCoverage: 0, coveredByDegree: [], notCoveredByDegree: [] },
      roadmap: [],
      roadmapProgress: {
        jobRoleId: roleDto.jobRoleId,
        completedModules: 0,
        totalModules: 0,
        progressPercent: 0,
        completedProjects: 0,
        totalProjects: 0,
        lastVisited: role.lastVisited,
      },
      resources: [],
      market: { salary: null, marketTrend: null, futureDemand: null, difficulty: null },
      lastVisited: role.lastVisited,
    };
  }
}
