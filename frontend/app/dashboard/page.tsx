import DashboardHeroCard from "./_components/DashboardHeroCard";
import MarketPulseCard from "./_components/MarketPulseCard";
import RecommendedJobsSection, { type RecommendedJob } from "./_components/RecommendedJobsSection";
import { IndustryNewsCard, SalaryRangeCard } from "./_components/SalaryAndNewsCards";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { handleGetAllJobPostings } from "@/lib/actions/admin/jobPosting-action";
import type { CareerDashboard } from "@/lib/api/dashboard";

const EMPTY_DASHBOARD: CareerDashboard = {
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

const RECOMMENDED_JOBS_LIMIT = 6;

export default async function Page() {
  const dashboardResult = await getCareerDashboardData();
  const dashboard: CareerDashboard = dashboardResult.success
    ? dashboardResult.data
    : EMPTY_DASHBOARD;

  // Recommended Jobs deliberately reuses the existing public job-postings
  // endpoint (filtered per target role) instead of a dedicated dashboard
  // endpoint — the job-finder page already lists from the same source.
  const jobResultsByRole = await Promise.all(
    dashboard.hero.map((role) =>
      handleGetAllJobPostings({ jobRole: role.jobRoleId, limit: 4 }),
    ),
  );

  const jobs: RecommendedJob[] = jobResultsByRole
    .flatMap((result) => (result.success ? (result.data as RecommendedJob[]) : []))
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, RECOMMENDED_JOBS_LIMIT);

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <DashboardHeroCard hero={dashboard.hero} />

          <MarketPulseCard marketPulse={dashboard.marketPulse} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.7fr)]">
          <SalaryRangeCard salaryRange={dashboard.salaryRange} />

          <IndustryNewsCard />
        </section>

        <RecommendedJobsSection jobs={jobs} hero={dashboard.hero} />
      </div>
    </div>
  );
}
