// Response-only DTOs. The dashboard never receives these from the client,
// so unlike the zod request DTOs elsewhere, plain interfaces are enough.

export interface CareerHeroDto {
  jobRoleId: string;
  jobRole: string;
  readinessScore: number;
  readinessLabel: string;
  missingSkills: string[];
}

export interface MarketPulseDto {
  jobRoleId: string;
  jobRole: string;
  jobCount: number;
  topLocations: string[];
  topCompanies: string[];
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
  marketPulse: MarketPulseDto[];
  salaryRange: SalaryRangeDto;
}
