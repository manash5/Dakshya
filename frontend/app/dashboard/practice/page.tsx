import Link from "next/link";
import { StaggerGroup, StaggerItem } from "../_components/AnimatedSection";
import ContinuePracticeHero from "./_components/ContinuePracticeHero";
import PracticeHistoryTable from './_components/PracticeHistoryTable';
import ProjectLearningSection from "./_components/ProjectLearningSection";
import MockInterviewCard from "./_components/MockInterviewCard";
import PracticeStreakCard from "./_components/PracticeStreakCard";
import SkillMasterySection from "./_components/SkillMasterySection";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { getSkillPlannerData } from "@/lib/actions/skillPlanner-action";
import { handleGetAttemptHistory } from "@/lib/actions/practiceAttempt-action";
import { handleGetAllProjects } from "@/lib/actions/project-action";
import { computePracticeStats } from "@/lib/utils/practiceStats";
import { buildPracticeRecommendation } from "@/lib/utils/practiceRecommendation";
import { buildProjectRecommendations } from "@/lib/utils/projectRecommendation";
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
  // Planners and projects are fetched for every target role (not just the
  // selected one) so Project-Based Learning can show projects across all of
  // the user's target roles instead of only whichever one is selected.
  const [plannerResults, historyResult, projectResults] = await Promise.all([
    Promise.all(dashboard.hero.map((role) => getSkillPlannerData(role.jobRoleId))),
    handleGetAttemptHistory({ limit: 60 }),
    Promise.all(
      dashboard.hero.map((role) => handleGetAllProjects({ careerRole: role.jobRoleId, limit: 20 })),
    ),
  ]);

  const planners: SkillPlanner[] = dashboard.hero.map((role, i) => {
    const result = plannerResults[i];
    return result.success ? result.data : emptyPlanner(role.jobRoleId, role.jobRole);
  });

  const planner: SkillPlanner =
    planners.find((p) => p.role.jobRoleId === selectedRoleId) ?? planners[0];
  const attempts = historyResult.success ? historyResult.data : [];
  const projects = projectResults.flatMap((result) => (result.success ? result.data : []));

  const stats = computePracticeStats(attempts);
  const recommendation = buildPracticeRecommendation(planner.skills);
  const completedProjectTitles = Array.from(
    new Set(planners.flatMap((p) => p.skills.flatMap((s) => s.project.projectTitles))),
  );
  const projectRecommendations = buildProjectRecommendations(planners, projects, completedProjectTitles);

  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <StaggerGroup className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <StaggerItem>
          <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-3xl font-bold text-transparent">
            Practice
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            What to work on next, based on your real skill gaps.
          </p>
        </StaggerItem>

        <StaggerItem>
          <ContinuePracticeHero
            roleTitle={planner.role.jobRole}
            readinessScore={planner.readinessScore}
            readinessLabel={planner.readinessLabel}
            recommendation={recommendation}
            jobRoleId={selectedRoleId}
            stats={stats}
          />
        </StaggerItem>

        <StaggerItem>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Skill Practice</h2>
          <SkillMasterySection planners={planners} />
        </StaggerItem>

        <StaggerItem className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <PracticeHistoryTable attempts={attempts} />

          <div className="flex flex-col gap-5">
            <MockInterviewCard jobRoleId={selectedRoleId} />
            <PracticeStreakCard stats={stats} />
          </div>
        </StaggerItem>

        <StaggerItem>
          <ProjectLearningSection
            heroRoles={dashboard.hero}
            projects={projects}
            completedProjectTitles={completedProjectTitles}
            recommendations={projectRecommendations}
          />
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
