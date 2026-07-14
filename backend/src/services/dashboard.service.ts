import { IJobRole } from "../models/jobRole.model";
import { IUserProgress } from "../models/userProgress.model";
import { ICareerKnowledge } from "../models/careerKnowledge.model";
import { UserProgressService } from "./userProgress.service";
import { JobPostingMongoRepository } from "../repository/jobPosting.repository";
import { CareerKnowledgeMongoRepository } from "../repository/careerKnowledge.repository";
import {
  CareerDashboardDto,
  CareerHeroDto,
  MarketPulseDto,
  SalaryRangeDto,
} from "../dtos/dashboard.dto";

const userProgressService = new UserProgressService();
const jobPostingRepository = new JobPostingMongoRepository();
const careerKnowledgeRepository = new CareerKnowledgeMongoRepository();

const READINESS_LABELS: { max: number; label: string }[] = [
  { max: 25, label: "Very Low" },
  { max: 50, label: "Needs Improvement" },
  { max: 70, label: "Average" },
  { max: 90, label: "Above Average" },
  { max: 100, label: "Interview Ready" },
];

const DIFFICULTY_LEVEL_LABELS: Record<string, string> = {
  Beginner: "Entry Level",
  Intermediate: "Mid Level",
  Advanced: "Senior Level",
};

const formatSalaryValue = (value: number): string =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`;

export class DashboardService {
  async getCareerDashboard(userId: string): Promise<CareerDashboardDto> {
    const progress = await userProgressService.getUserProgress(userId);

    if (progress.targetRoleProgress.length === 0) {
      return {
        hero: [],
        marketPulse: [],
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

    const marketPulse = await Promise.all(
      progress.targetRoleProgress.map((role) => this.toMarketPulseDto(role)),
    );

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
      readinessLabel: this.getReadinessLabel(role.readinessScore),
      missingSkills: role.missingSkills.slice(0, 3),
    };
  }

  private async toMarketPulseDto(
    role: IUserProgress["targetRoleProgress"][number],
  ): Promise<MarketPulseDto> {
    const jobRole = role.jobRoleId as unknown as IJobRole;

    const stats = await jobPostingRepository.getMarketPulseByRole(
      jobRole._id.toString(),
    );

    return {
      jobRoleId: jobRole._id.toString(),
      jobRole: jobRole.title,
      jobCount: stats.jobCount,
      topLocations: stats.topLocations,
      topCompanies: stats.topCompanies,
    };
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

  private getReadinessLabel(score: number): string {
    const bucket = READINESS_LABELS.find((entry) => score <= entry.max);
    return bucket?.label ?? "Interview Ready";
  }

  private getLevelLabel(knowledge: ICareerKnowledge): string {
    return DIFFICULTY_LEVEL_LABELS[knowledge.difficulty] ?? knowledge.difficulty;
  }
}
