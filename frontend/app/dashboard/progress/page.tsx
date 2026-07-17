import Link from "next/link";
import RoleTabs from "./_components/RoleTabs";
import RoadmapBoard from "./_components/RoadmapBoard";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { getSkillPlannerData } from "@/lib/actions/skillPlanner-action";
import { handleTouchRoadmapVisit } from "@/lib/actions/userProgress-action";
import { handleGetAttemptHistory } from "@/lib/actions/practiceAttempt-action";
import type { CareerDashboard } from "@/lib/api/dashboard";
import type { SkillPlanner } from "@/lib/api/skillPlanner";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";

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

const emptyPlanner = (jobRoleId: string, jobRole: string): SkillPlanner => ({
  role: { jobRoleId, jobRole, category: "" },
  hasCareerKnowledge: false,
  readinessScore: 0,
  readinessLabel: "Very Low",
  requiredSkillsCount: 0,
  matchedSkillsCount: 0,
  skills: [],
  degreeVsMarket: { curriculumCoverage: 0, coveredByDegree: [], notCoveredByDegree: [] },
  roadmap: [],
  roadmapProgress: {
    jobRoleId,
    completedModules: 0,
    totalModules: 0,
    progressPercent: 0,
    completedProjects: 0,
    totalProjects: 0,
    lastVisited: null,
  },
  resources: [],
  market: { salary: null, marketTrend: null, futureDemand: null, difficulty: null },
  lastVisited: null,
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;

  const dashboardResult = await getCareerDashboardData();
  const dashboard: CareerDashboard = dashboardResult.success
    ? dashboardResult.data
    : EMPTY_DASHBOARD;

  if (dashboard.hero.length === 0) {
    return (
      <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white py-20 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Roadmap</h1>
          <p className="max-w-md text-neutral-500">
            Pick a target career on your profile to unlock your personalized roadmap.
          </p>
          <Link
            href="/dashboard/profile"
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Set a target role
          </Link>
        </div>
      </div>
    );
  }

  const selectedHero =
    dashboard.hero.find((r) => r.jobRoleId === roleParam) ?? dashboard.hero[0];
  const selectedRoleId = selectedHero.jobRoleId;

  // Independent read (PracticeAttempt, for the step-completion practice
  // gate) — doesn't touch UserProgress, safe to run alongside the
  // planner/touch pair below rather than after it.
  const attemptsPromise = handleGetAttemptHistory({ jobRoleId: selectedRoleId, limit: 100 });

  // Sequential, not Promise.all: both calls mutate the same UserProgress
  // document (skill planner self-heals readiness, roadmap-visit stamps
  // lastVisited) — running them concurrently would let one read-modify-write
  // clobber the other's change. Awaiting in order means the second call
  // always reads the first's write. Same reasoning as the Planner page.
  const plannerResult = await getSkillPlannerData(selectedRoleId);
  await handleTouchRoadmapVisit(selectedRoleId);

  const attemptsResult = await attemptsPromise;

  const planner: SkillPlanner = plannerResult.success
    ? plannerResult.data
    : emptyPlanner(selectedRoleId, selectedHero.jobRole);

  const attempts: PracticeAttempt[] = attemptsResult.success ? attemptsResult.data : [];

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-3xl font-bold text-transparent">
              {planner.role.jobRole} Roadmap
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              Your step-by-step path to becoming a{" "}
              <span className="font-semibold text-neutral-900">{planner.role.jobRole}</span>
              {!planner.hasCareerKnowledge && " — insights coming soon."}
            </p>
          </div>

          <RoleTabs roles={dashboard.hero} selectedRoleId={selectedRoleId} />
        </div>

        <RoadmapBoard
          roadmap={planner.roadmap}
          roadmapProgress={planner.roadmapProgress}
          skills={planner.skills}
          attempts={attempts}
          jobRoleId={selectedRoleId}
        />
      </div>
    </div>
  );
}
