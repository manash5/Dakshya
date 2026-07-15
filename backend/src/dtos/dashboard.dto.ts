// Response-only DTOs. The dashboard never receives these from the client,
// so unlike the zod request DTOs elsewhere, plain interfaces are enough.

export interface CareerHeroDto {
  jobRoleId: string;
  jobRole: string;
  readinessScore: number;
  readinessLabel: string;
  missingSkills: string[];
}

export interface SkillDemandDto {
  skill: string;
  // How many of totalJobs (below) require this skill.
  jobCount: number;
}

export interface MarketPulseDto {
  // Size of the combined live-posting pool across every one of the user's
  // target roles at once (not per role).
  totalJobs: number;
  // The user's acquired skills, sorted by jobCount descending.
  skills: SkillDemandDto[];
}

export interface SalaryRangeDto {
  min: number | null;
  max: number | null;
  currency: string | null;
  formatted: string;
  jobRole: string | null;
  levelLabel: string | null;
}

export interface CareerDashboardDto {
  hero: CareerHeroDto[];
  marketPulse: MarketPulseDto;
  salaryRange: SalaryRangeDto;
}
