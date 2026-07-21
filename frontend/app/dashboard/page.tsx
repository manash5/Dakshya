import { StaggerGroup, StaggerItem } from "./_components/AnimatedSection";
import DashboardHeroCard from "./_components/DashboardHeroCard";
import MarketPulseCard from "./_components/MarketPulseCard";
import RecommendedJobsSection, { type RecommendedJob } from "./_components/RecommendedJobsSection";
import { OpportunitiesCard, SalaryRangeCard } from "./_components/SalaryAndNewsCards";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { handleGetAllJobPostings } from "@/lib/actions/admin/jobPosting-action";
import { handleGetAllOpportunities } from "@/lib/actions/opportunity-action";
import { dedupeJobListings } from "@/lib/utils/dedupeJobs";
import type { CareerDashboard } from "@/lib/api/dashboard";

const EMPTY_DASHBOARD: CareerDashboard = {
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

const RECOMMENDED_JOBS_LIMIT = 3;
const OPPORTUNITIES_LIMIT = 4;

export default async function Page() {
  const dashboardResult = await getCareerDashboardData();

  const dashboard: CareerDashboard = dashboardResult.success
    ? dashboardResult.data
    : EMPTY_DASHBOARD;

  const targetRoleIds = dashboard.hero.map((role) => role.jobRoleId);

  // Recommended Jobs deliberately reuses the existing public job-postings
  // endpoint (filtered per target role) instead of a dedicated dashboard
  // endpoint — the job-finder page already lists from the same source.
  // Jobs aren't tagged to a role in storage (see jobPosting.model.ts), so
  // this filters by jobRoleId, which the backend resolves into the same
  // title/keyword-aware match Market Pulse already uses — a literal-text
  // search here would silently disagree with Market Pulse's job count.
  const [jobResultsByRole, opportunitiesResult] = await Promise.all([
    Promise.all(
      dashboard.hero.map(async (role) => ({
        role,
        result: await handleGetAllJobPostings({ jobRoleId: role.jobRoleId, limit: 4 }),
      })),
    ),
    handleGetAllOpportunities({ limit: OPPORTUNITIES_LIMIT, jobRoleIds: targetRoleIds }),
  ]);

  const opportunities = opportunitiesResult.success ? opportunitiesResult.data : [];

  const flatJobs: RecommendedJob[] = jobResultsByRole.flatMap(({ role, result }) =>
    result.success
      ? (result.data as any[]).map((job) => ({ ...job, matchedRoleId: role.jobRoleId }))
      : [],
  );
  const jobs = dedupeJobListings(flatJobs, RECOMMENDED_JOBS_LIMIT);

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <StaggerGroup className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <StaggerItem className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <DashboardHeroCard hero={dashboard.hero} />

          <MarketPulseCard marketPulse={dashboard.marketPulse} />
        </StaggerItem>

        <StaggerItem className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.7fr)]">
          <SalaryRangeCard salaryRange={dashboard.salaryRange} />

          <OpportunitiesCard opportunities={opportunities} />
        </StaggerItem>

        <StaggerItem>
          <RecommendedJobsSection jobs={jobs} hero={dashboard.hero} />
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
