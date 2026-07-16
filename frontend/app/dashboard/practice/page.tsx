import Link from "next/link";
import PracticeHistoryTable from './_components/PracticeHistoryTable';
import PracticeTopBar from "./_components/PracticeTopBar";
import ProjectLearningSection from "./_components/ProjectLearningSection";
import QuickDrillCard from "./_components/QuickDrillCard";
import PracticeStreakCard from "./_components/PracticeStreakCard";
import SkillMasterySection from "./_components/SkillMasterySection";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { getSkillPlannerData } from "@/lib/actions/skillPlanner-action";
import { handleGetAttemptHistory } from "@/lib/actions/practiceAttempt-action";
import { handleGetAllProjects } from "@/lib/actions/project-action";
import { computePracticeStats } from "@/lib/utils/practiceStats";
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
        <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white py-20 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Practice</h1>
          <p className="max-w-md text-neutral-500">
            Pick a target career on your profile to unlock skill-scoped interview practice.
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

  // Pure reads, nothing mutates -> parallel (unlike the Skill Planner page's
  // plannerResult+touchRoadmapVisit pairing, which has to be sequential).
  const [plannerResult, historyResult, projectsResult] = await Promise.all([
    getSkillPlannerData(selectedRoleId),
    handleGetAttemptHistory({ limit: 60 }),
    handleGetAllProjects({ careerRole: selectedRoleId, limit: 6 }),
  ]);

  const planner: SkillPlanner = plannerResult.success
    ? plannerResult.data
    : emptyPlanner(selectedRoleId, selectedHero.jobRole);
  const attempts = historyResult.success ? historyResult.data : [];
  const projects = projectsResult.success ? projectsResult.data : [];

  const topGapSkill = planner.skills[0] ?? null;
  const stats = computePracticeStats(attempts);
  const completedProjectTitles = Array.from(
    new Set(planner.skills.flatMap((s) => s.project.projectTitles)),
  );

  const generalInterviewHref = `/dashboard/practice/interview?jobRoleId=${selectedRoleId}`;
  const quickDrillHref = topGapSkill
    ? `${generalInterviewHref}&skill=${encodeURIComponent(topGapSkill.skill)}&skillLabel=${encodeURIComponent(topGapSkill.displayName)}`
    : generalInterviewHref;

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PracticeTopBar />
          <Link
            href={generalInterviewHref}
            className="flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Start AI Interview
          </Link>
        </div>

        <SkillMasterySection jobRoleId={selectedRoleId} skills={planner.skills} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <PracticeHistoryTable attempts={attempts} />

          <div className="flex flex-col gap-5">
            <QuickDrillCard href={quickDrillHref} skillLabel={topGapSkill?.displayName ?? null} />
            <PracticeStreakCard stats={stats} />
          </div>
        </section>

        <ProjectLearningSection
          jobRoleId={selectedRoleId}
          projects={projects}
          completedProjectTitles={completedProjectTitles}
        />
      </div>
    </div>
  );
}
