import { IJobRole } from "../models/jobRole.model";
import { IUserProgress } from "../models/userProgress.model";
import { ICareerKnowledge } from "../models/careerKnowledge.model";
import { UserProgressService } from "./userProgress.service";
import { JobPostingMongoRepository } from "../repository/jobPosting.repository";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import { getReadinessLabel } from "../lib/readiness";
import {
  CareerDashboardDto,
  CareerHeroDto,
  MarketPulseDto,
  SalaryRangeDto,
} from "../dtos/dashboard.dto";

const userProgressService = new UserProgressService();
const jobPostingRepository = new JobPostingMongoRepository();
const careerKnowledgeRepository = new CareerKnowledgeMongoRepository();

const DIFFICULTY_LEVEL_LABELS: Record<string, string> = {
  Beginner: "Entry Level",
  Intermediate: "Mid Level",
  Advanced: "Senior Level",
};

const formatSalaryValue = (value: number): string =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`;

export class DashboardService {
  async getCareerDashboard(userId: string): Promise<CareerDashboardDto> {
    // checkForKnowledgeUpdates both fetches progress AND recomputes
    // readiness/missingSkills if the target role's CareerKnowledge changed
    // since it was last analyzed — so every dashboard load self-heals
    // instead of only refreshing at login (JWTs live 30 days).
    const progress = await userProgressService.checkForKnowledgeUpdates(userId);

    if (progress.targetRoleProgress.length === 0) {
      return {
        hero: [],
        marketPulse: { totalJobs: 0, skills: [] },
        salaryRange: {
          min: null,
          max: null,
          currency: null,
          formatted: "Not Available",
          jobRole: null,
          levelLabel: null,
        },
      };
    }

    const hero = progress.targetRoleProgress.map((role) =>
      this.toHeroDto(role),
    );

    const marketPulse = await this.getMarketPulse(progress);

    const salaryRange = await this.getSalaryRange(progress.targetRoleProgress);

    return { hero, marketPulse, salaryRange };
  }

  private toHeroDto(
    role: IUserProgress["targetRoleProgress"][number],
  ): CareerHeroDto {
    const jobRole = role.jobRoleId as unknown as IJobRole;

    return {
      jobRoleId: jobRole._id.toString(),
      jobRole: jobRole.title,
      readinessScore: role.readinessScore,
      readinessLabel: getReadinessLabel(role.readinessScore),
      missingSkills: role.missingSkills.slice(0, 3),
    };
  }

  // Demand for the skills the user already has, scoped to the combined
  // pool of live postings across every target role at once — "out of the
  // N jobs matching your target roles, how many need this skill" — rather
  // than a per-role job-count breakdown.
  private async getMarketPulse(progress: IUserProgress): Promise<MarketPulseDto> {
    const roles = progress.targetRoleProgress.map((role) => {
      const jobRole = role.jobRoleId as unknown as IJobRole;
      return { title: jobRole.title, keywords: jobRole.keywords ?? [] };
    });

    const skills = progress.acquiredSkills.map((entry) => entry.skill);

    const { totalJobs, skillDemand } = await jobPostingRepository.getSkillDemand(
      roles,
      skills,
    );

    const rankedSkills = skills
      .map((skill) => ({ skill, jobCount: skillDemand[skill] ?? 0 }))
      .sort((a, b) => b.jobCount - a.jobCount);

    return { totalJobs, skills: rankedSkills };
  }

  // Salary is sourced from CareerKnowledge (structured min/max/currency)
  // rather than parsed from JobPosting's free-text salary strings, and is
  // scoped to the user's furthest-along target role since it's shown as a
  // single figure, not a per-role carousel.
  private async getSalaryRange(
    targetRoleProgress: IUserProgress["targetRoleProgress"],
  ): Promise<SalaryRangeDto> {
    const primaryRole = [...targetRoleProgress].sort(
      (a, b) => b.readinessScore - a.readinessScore,
    )[0];

    const jobRole = primaryRole.jobRoleId as unknown as IJobRole;

    const knowledge = await careerKnowledgeRepository.findByJobRoleId(
      jobRole._id.toString(),
    );

    if (!knowledge) {
      return {
        min: null,
        max: null,
        currency: null,
        formatted: "Not Available",
        jobRole: jobRole.title,
        levelLabel: null,
      };
    }

    const { min, max, currency } = knowledge.salary;

    return {
      min,
      max,
      currency,
      formatted: `${currency} ${formatSalaryValue(min)} - ${formatSalaryValue(max)}`,
      jobRole: jobRole.title,
      levelLabel: this.getLevelLabel(knowledge),
    };
  }

  private getLevelLabel(knowledge: ICareerKnowledge): string {
    return DIFFICULTY_LEVEL_LABELS[knowledge.difficulty] ?? knowledge.difficulty;
  }
}
