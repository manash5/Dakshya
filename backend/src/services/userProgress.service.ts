import { HttpException } from "../exceptions/http-exceptions";

import { IUserProgress } from "../models/userProgress.model";

import {
  CreateUserProgressDto,
  UpdateUserProgressDto,
  RoadmapProgressDto,
} from "../dtos/userProgress.dto";

import {
  IUserProgressRepository,
  UserProgressMongoRepository,
} from "../repository/userProgress.repository";

import { UserMongoRepository } from "../repository/user.repository";
import { SubjectMongoRepository } from "../repository/subject.repository";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import {
  extractRequiredSkills,
  calculateMissingSkills,
  calculateReadinessScore,
} from "../lib/readiness";
import mongoose from "mongoose";

const progressRepository = new UserProgressMongoRepository();

const userRepository = new UserMongoRepository();

const subjectRepository = new SubjectMongoRepository();

const careerKnowledgeRepository = new CareerKnowledgeMongoRepository();

export interface IUserProgressService {
  initializeUserProgress(userId: string, currentSemester?: number): Promise<IUserProgress>;

  getUserProgress(userId: string): Promise<IUserProgress>;

  changeCurrentSemester(userId: string, semester: number): Promise<void>;

  syncTargetRoles(userId: string);

  deleteUserProgress(userId: string): Promise<boolean>;

  completeRoadmapStep(
    userId: string,
    jobRoleId: string,
    stepOrder: number,
  ): Promise<IUserProgress>;

  completeProject(
    userId: string,
    jobRoleId: string,
    projectTitle: string,
  ): Promise<IUserProgress>;

  refreshUserReadiness(userId: string): Promise<IUserProgress>;

  refreshAcademicProgress(userId: string): Promise<IUserProgress>;

  refreshReadinessForRole(jobRoleId: string): Promise<void>;

  touchRoadmapVisit(userId: string, jobRoleId: string): Promise<IUserProgress>;

  getRoadmapProgress(userId: string, jobRoleId: string): Promise<RoadmapProgressDto>;
}

export class UserProgressService implements IUserProgressService {
  // initilze user progress
  async initializeUserProgress(
    userId: string,
    currentSemester: number = 1,
  ): Promise<IUserProgress> {
    const existing = await progressRepository.findByUserId(userId);

    if (existing) {
      throw new HttpException(400, "User progress already exists.");
    }

    const createUserProgressData: CreateUserProgressDto = {
      userId,
      currentSemester,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    };
    return await progressRepository.create(createUserProgressData);
  }

  // get user progress
  async getUserProgress(userId: string): Promise<IUserProgress> {
    const progress = await progressRepository.findByUserId(userId);

    if (!progress) {
      throw new HttpException(404, "User progress not found.");
    }

    return progress;
  }

  // change current semester
  async changeCurrentSemester(userId: string, semester: number): Promise<void> {
    const progress = await this.getOrCreateProgress(userId);
    progress.currentSemester = semester;
    await progressRepository.update(progress._id.toString(), {
      currentSemester: semester,
    });
    await this.refreshAcademicProgress(userId);
  }

  // add and updates the target roles
  async syncTargetRoles(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const progress = await this.getOrCreateProgress(userId);
    const selectedRoles = user.targetRoles.map((id) => id.toString());
    const existingRoles = progress.targetRoleProgress.map((role) =>
      role.jobRoleId._id.toString(),
    );

    for (const roleId of selectedRoles) {
      if (!existingRoles.includes(roleId)) {
        progress.targetRoleProgress.push({
          jobRoleId: new mongoose.Types.ObjectId(roleId),
          readinessScore: 0,
          missingSkills: [],
          completedRoadmapSteps: [],
          roadmapStepProgress: [],
          selfReportedSkills: [],
          completedProjects: [],
          lastAnalyzed: new Date(),
          lastVisited: null,
        });
      }
    }

    progress.targetRoleProgress = progress.targetRoleProgress.filter((role) =>
      selectedRoles.includes(role.jobRoleId._id.toString()),
    );

    await progressRepository.update(progress._id.toString(), {
      targetRoleProgress: progress.targetRoleProgress,
    });

    // A role with no CareerKnowledge yet no longer aborts this — see
    // refreshUserReadiness — so this shouldn't throw in the common case
    // anymore, but a genuine failure (e.g. DB write error) still should
    // surface to the caller.
    await this.refreshUserReadiness(userId);
  }

  // updates our academic progress
  async refreshAcademicProgress(userId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);
    const completedSubjects = await this.updateCompletedSubjects(progress);
    const acquiredSkills = await this.updateAcquiredSkills(progress);
    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        completedSubjects,
        acquiredSkills,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to refresh academic progress");
    }
    return await this.refreshUserReadiness(userId);
  }

  //updates the roadmap step that we just completed
  async completeRoadmapStep(
    userId: string,
    jobRoleId: string,
    stepOrder: number,
  ): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    const alreadyCompleted = role.completedRoadmapSteps.some(
      (step) => step.stepOrder === stepOrder,
    );

    if (!alreadyCompleted) {
      role.completedRoadmapSteps.push({
        stepOrder,
        completedAt: new Date(),
      });
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to update roadmap progress");
    }

    return await this.refreshUserReadiness(userId);
  }

  // records that the user watched a given resource while working on a roadmap step
  async markRoadmapStepResourceWatched(
    userId: string,
    jobRoleId: string,
    stepOrder: number,
    resourceUrl: string,
  ): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    let stepProgress = role.roadmapStepProgress.find(
      (s) => s.stepOrder === stepOrder,
    );

    if (!stepProgress) {
      stepProgress = { stepOrder, watchedResourceUrls: [] };
      role.roadmapStepProgress.push(stepProgress);
    }

    if (!stepProgress.watchedResourceUrls.includes(resourceUrl)) {
      stepProgress.watchedResourceUrls.push(resourceUrl);
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to update roadmap step resource progress");
    }

    return await this.refreshUserReadiness(userId);
  }

  // records a free-text self-report of how the user used a skill -- no AI
  // evaluation, just flags the skill as self-reported evidence (one entry
  // per skill; resubmitting updates the existing entry rather than growing
  // the array)
  async submitSelfReportedSkill(
    userId: string,
    jobRoleId: string,
    skill: string,
    description: string,
  ): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    const normalizedSkill = skill.toLowerCase().trim();

    const existing = role.selfReportedSkills.find(
      (s) => s.skill === normalizedSkill,
    );

    if (existing) {
      existing.description = description;
      existing.reportedAt = new Date();
    } else {
      role.selfReportedSkills.push({
        skill: normalizedSkill,
        description,
        reportedAt: new Date(),
      });
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to save self-reported skill");
    }

    return await this.refreshUserReadiness(userId);
  }

  // udpates the project we just completed
  async completeProject(
    userId: string,
    jobRoleId: string,
    projectTitle: string,
    githubLink?: string,
  ): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    const alreadyCompleted = role.completedProjects.some(
      (project) =>
        project.projectTitle.toLowerCase() === projectTitle.toLowerCase(),
    );

    if (!alreadyCompleted) {
      role.completedProjects.push({
        projectTitle,
        completedAt: new Date(),
        githubLink: githubLink ?? null,
      });
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to update completed projects");
    }

    return await this.refreshUserReadiness(userId);
  }

  //updates the user readiness
  async refreshUserReadiness(userId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    for (const role of progress.targetRoleProgress) {
      const jobRoleId = role.jobRoleId._id.toString();
      const knowledge = await careerKnowledgeRepository.findByJobRoleId(jobRoleId);

      if (!knowledge) {
        // No CareerKnowledge generated for this role yet. Leave its score
        // as-is and move on — this used to throw and abort the whole loop,
        // which meant one role missing its data silently zeroed out every
        // OTHER role's score too, since the batch update below never ran.
        console.warn(
          `[readiness] No CareerKnowledge for job role ${jobRoleId} yet — skipping`,
        );
        continue;
      }

      const requiredSkills = extractRequiredSkills(knowledge);
      const acquiredSkills = progress.acquiredSkills.map((skill) => skill.skill);
      const missingSkills = calculateMissingSkills(requiredSkills, acquiredSkills);

      role.readinessScore = calculateReadinessScore(requiredSkills, missingSkills);
      role.missingSkills = missingSkills;
      role.lastAnalyzed = new Date();
    }

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to refresh user readiness");
    }

    return updatedProgress;
  }

  // Push-refresh readiness for every user currently tracking this job role,
  // so admin generating/regenerating a role's CareerKnowledge is reflected
  // immediately instead of waiting for checkForKnowledgeUpdates to run at
  // the user's next login.
  async refreshReadinessForRole(jobRoleId: string): Promise<void> {
    const userIds = await progressRepository.findUserIdsByTargetRole(jobRoleId);

    for (const userId of userIds) {
      try {
        await this.refreshUserReadiness(userId);
      } catch (e) {
        console.warn(
          `[readiness] Failed to refresh user ${userId} for role ${jobRoleId}:`,
          (e as Error).message,
        );
      }
    }
  }

  async deleteUserProgress(userId: string): Promise<boolean> {
    const progress = await progressRepository.findByUserId(userId);

    if (!progress) {
      return true;
    }

    const deleted = await progressRepository.deleteByUserId(userId);

    if (!deleted) {
      throw new HttpException(500, "Failed to delete user progress");
    }

    return true;
  }

  // checks if we need to update the progress of the user if the job knowledge is updated or changed
  async checkForKnowledgeUpdates(userId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    let hasChanges = false;

    for (const role of progress.targetRoleProgress) {
      const knowledge = await careerKnowledgeRepository.findByJobRoleId(
        role.jobRoleId._id.toString(),
      );

      if (!knowledge) {
        continue;
      }

      if (knowledge.aiGeneratedDate > role.lastAnalyzed) {
        const requiredSkills = extractRequiredSkills(knowledge);
        const acquiredSkills = progress.acquiredSkills.map((skill) => skill.skill);
        const missingSkills = calculateMissingSkills(requiredSkills, acquiredSkills);

        role.readinessScore = calculateReadinessScore(requiredSkills, missingSkills);
        role.missingSkills = missingSkills;
        role.lastAnalyzed = new Date();

        hasChanges = true;
      }
    }

    if (!hasChanges) {
      return progress;
    }

    const updated = await progressRepository.update(progress._id.toString(), {
      targetRoleProgress: progress.targetRoleProgress,
    });

    if (!updated) {
      throw new HttpException(500, "Failed to refresh progress");
    }

    return updated;
  }

  // Called when a user opens the roadmap/progress page for a specific
  // target role — powers a "continue where you left off" UI.
  async touchRoadmapVisit(userId: string, jobRoleId: string): Promise<IUserProgress> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    role.lastVisited = new Date();

    const updatedProgress = await progressRepository.update(
      progress._id.toString(),
      {
        targetRoleProgress: progress.targetRoleProgress,
      },
    );

    if (!updatedProgress) {
      throw new HttpException(500, "Failed to update last visited");
    }

    return updatedProgress;
  }

  // Computed on the fly from targetRoleProgress + that role's CareerKnowledge
  // instead of a persisted UserRoadmapProgress collection — see
  // RoadmapProgressDto for why.
  async getRoadmapProgress(userId: string, jobRoleId: string): Promise<RoadmapProgressDto> {
    const progress = await this.getUserProgress(userId);

    const role = progress.targetRoleProgress.find(
      (r) => r.jobRoleId._id.toString() === jobRoleId,
    );

    if (!role) {
      throw new HttpException(404, "Target role not found");
    }

    const knowledge = await careerKnowledgeRepository.findByJobRoleId(jobRoleId);

    const totalModules = knowledge?.roadmap.length ?? 0;
    const totalProjects = knowledge?.projects.length ?? 0;
    const completedModules = role.completedRoadmapSteps.length;

    return {
      jobRoleId,
      completedModules,
      totalModules,
      progressPercent:
        totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
      completedProjects: role.completedProjects.length,
      totalProjects,
      lastVisited: role.lastVisited,
    };
  }

  // ====================== Private Methods ===============================

  // Callers like admin user edits shouldn't have to know or care whether a
  // student has a UserProgress doc yet (e.g. an account whose
  // onboardingCompleted flag was set directly rather than through the real
  // onboarding flow — see completeOnboarding). Lazily creating it here keeps
  // changeCurrentSemester/syncTargetRoles safe to call unconditionally
  // instead of throwing 404 and aborting the caller's own update.
  private async getOrCreateProgress(userId: string): Promise<IUserProgress> {
    const existing = await progressRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    const createUserProgressData: CreateUserProgressDto = {
      userId,
      currentSemester: 1,
      completedSubjects: [],
      acquiredSkills: [],
      targetRoleProgress: [],
    };
    return await progressRepository.create(createUserProgressData);
  }

  private async updateCompletedSubjects(progress: IUserProgress) {
    const user = await userRepository.findById(progress.userId._id.toString());
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const subjects = await subjectRepository.findByCourse(
      user.courseId.toString(),
    );
    return subjects
      .filter((subject) => subject.semester <= progress.currentSemester)
      .map((subject) => ({
        subjectId: subject._id,
        completedAt: new Date(),
        grade: undefined,
      }));
  }

  private async updateAcquiredSkills(progress: IUserProgress) {
    const user = await userRepository.findById(progress.userId._id.toString());
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const subjects = await subjectRepository.findByCourse(
      user.courseId.toString(),
    );
    const completedSubjects = subjects.filter(
      (subject) => subject.semester <= progress.currentSemester,
    );
    const uniqueSkills = new Set<string>();
    for (const subject of completedSubjects) {
      subject.skills.forEach((skill) => uniqueSkills.add(skill));
    }
    return [...uniqueSkills].map((skill) => ({
      skill,
      lastUpdated: new Date(),
    }));
  }
}
