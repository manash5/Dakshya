import Link from "next/link";
import { StaggerGroup, StaggerItem } from "./_components/AnimatedSection";
import FocusCategoriesCard from "./_components/FocusCategoriesCard";
import MarketAlignmentCard from "./_components/MarketAlignmentCard";
import SkillsScoreCard from "./_components/SkillsScoreCard";
import DegreeVsMarketCard from "./_components/DegreeVsMarketCard";
import PracticeCard from "./_components/PracticeCard";
import ResourceLibraryCard from "./_components/ResourceLibraryCard";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { getSkillPlannerData } from "@/lib/actions/skillPlanner-action";
import { handleTouchRoadmapVisit } from "@/lib/actions/userProgress-action";
import type { CareerDashboard } from "@/lib/api/dashboard";
import type { SkillPlanner } from "@/lib/api/skillPlanner";

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
          <h1 className="text-2xl font-bold text-neutral-900">Skill Planner</h1>
          <p className="max-w-md text-neutral-500">
            Pick a target career on your profile to unlock your Skill Planner — your
            readiness, skill graph, and resources for that role.
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

  // Sequential, not Promise.all: both calls mutate the same UserProgress
  // document (skill planner self-heals readiness, roadmap-visit stamps
  // lastVisited) — running them concurrently would let one read-modify-write
  // clobber the other's change. Awaiting in order means the second call
  // always reads the first's write.
  const plannerResult = await getSkillPlannerData(selectedRoleId);
  await handleTouchRoadmapVisit(selectedRoleId);

  const planner: SkillPlanner = plannerResult.success
    ? plannerResult.data
    : emptyPlanner(selectedRoleId, selectedHero.jobRole);

  // Top of the worst-gap-first sorted list — the Practice panel always
  // shows this role's highest-priority skill.
  const selectedSkill = planner.skills[0] ?? null;

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <StaggerGroup className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
        <StaggerItem>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-3xl font-bold text-transparent">
                Skill Planner
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Your journey toward becoming a{" "}
                <span className="font-semibold text-neutral-900">{planner.role.jobRole}</span>
                {!planner.hasCareerKnowledge && " — insights coming soon."}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border border-black/5 bg-white px-5 py-3 shadow-sm sm:self-auto">
              <div className="text-right">
                <p className="text-2xl font-bold text-[#5C8A1C]">
                  {planner.readinessScore}%
                </p>
                <p className="text-xs text-neutral-400">{planner.readinessLabel}</p>
              </div>
            </div>
          </header>
        </StaggerItem>

        <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-5">
            <StaggerItem>
              <FocusCategoriesCard roles={dashboard.hero} selectedRoleId={selectedRoleId} />
            </StaggerItem>
            <StaggerItem>
              <MarketAlignmentCard
                matchScore={planner.readinessScore}
                matchedSkillsCount={planner.matchedSkillsCount}
                requiredSkillsCount={planner.requiredSkillsCount}
                roleTitle={planner.role.jobRole}
              />
            </StaggerItem>
          </div>

          <div className="flex flex-col gap-5">
            <StaggerItem>
              <SkillsScoreCard skills={planner.skills} jobRoleId={selectedRoleId} />
            </StaggerItem>
            <StaggerItem>
              <DegreeVsMarketCard
                skills={planner.skills}
                curriculumCoveragePercent={planner.degreeVsMarket.curriculumCoverage}
              />
            </StaggerItem>
          </div>

          <div className="flex flex-col gap-5">
            <StaggerItem>
              <PracticeCard selectedSkill={selectedSkill} jobRoleId={selectedRoleId} />
            </StaggerItem>
            <StaggerItem>
              <ResourceLibraryCard resources={planner.resources} />
            </StaggerItem>
          </div>
        </section>
      </StaggerGroup>
    </div>
  );
}
