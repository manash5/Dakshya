import { Suspense } from "react";
import { StaggerGroup, StaggerItem } from "../_components/AnimatedSection";
import JobFinderTopBar from "./_components/JobFinderTopBar";
import RecommendedJobsGrid, { type RecommendedJob } from "./_components/RecommendedJobsGrid";
import CvAnalyzerCard from "./_components/CvAnalyzerCard";
import CareerInsightCard from "./_components/CareerInsightCard";
import SavedJobsCard from "./_components/SavedJobsCard";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { handleGetAllJobPostings } from "@/lib/actions/admin/jobPosting-action";
import { handleGetSavedJobs } from "@/lib/actions/savedJob-action";
import { handleGetLatestResumeAnalysis } from "@/lib/actions/resumeAnalysis-action";
import type { CareerDashboard } from "@/lib/api/dashboard";
import type { SavedJob } from "@/lib/api/savedJob";

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

// Generous rather than paginated — the ask is "show all jobs matching my
// target roles," not a curated shortlist (that's what the dashboard's
// smaller preview is for).
const RESULTS_LIMIT = 200;
const PER_ROLE_LIMIT = 50;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  // Independent GETs, nothing mutates -> parallel.
  const [dashboardResult, savedJobsResult, resumeResult] = await Promise.all([
    getCareerDashboardData(),
    handleGetSavedJobs({ limit: 50 }),
    handleGetLatestResumeAnalysis(),
  ]);

  const dashboard: CareerDashboard = dashboardResult.success
    ? dashboardResult.data
    : EMPTY_DASHBOARD;
  const savedJobs: SavedJob[] = savedJobsResult.success ? savedJobsResult.data : [];
  const resumeAnalysis = resumeResult.success ? resumeResult.data : null;

  const readinessByRole: Record<string, number> = Object.fromEntries(
    dashboard.hero.map((r) => [r.jobRoleId, r.readinessScore]),
  );
  const savedJobIds = savedJobs.map((sj) => sj.jobPostingId._id);

  let jobs: RecommendedJob[];

  if (search) {
    const result = await handleGetAllJobPostings({ search, limit: RESULTS_LIMIT });
    jobs = result.success
      ? (result.data as any[]).map((job) => ({
          ...job,
          matchedRoleId: dashboard.hero[0]?.jobRoleId ?? "",
        }))
      : [];
  } else {
    // Same per-role fan-out / dedupe / sort pattern as the main dashboard —
    // jobs aren't tagged to a role in storage, so this searches by each
    // target role's title text (see dashboard/page.tsx).
    const jobResultsByRole = await Promise.all(
      dashboard.hero.map(async (role) => ({
        role,
        result: await handleGetAllJobPostings({ search: role.jobRole, limit: PER_ROLE_LIMIT }),
      })),
    );

    const seenJobIds = new Set<string>();
    jobs = jobResultsByRole
      .flatMap(({ role, result }) =>
        result.success
          ? (result.data as any[]).map((job) => ({ ...job, matchedRoleId: role.jobRoleId }))
          : [],
      )
      .filter((job) => (seenJobIds.has(job._id) ? false : (seenJobIds.add(job._id), true)))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, RESULTS_LIMIT);
  }

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <StaggerGroup className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <StaggerItem>
          <Suspense fallback={null}>
            <JobFinderTopBar initialSearch={search ?? ""} />
          </Suspense>
        </StaggerItem>

        <StaggerItem className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <RecommendedJobsGrid jobs={jobs} readinessByRole={readinessByRole} savedJobIds={savedJobIds} />

          <div className="flex flex-col gap-5">
            <CvAnalyzerCard analysis={resumeAnalysis} />
            <CareerInsightCard hero={dashboard.hero[0] ?? null} />
            <SavedJobsCard savedJobs={savedJobs} />
          </div>
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
