import { getUserData } from "@/lib/actions/auth-action";
import { getJobRoles } from "@/lib/actions/onboarding-action";
import { getCareerDashboardData } from "@/lib/actions/dashboard-action";
import { getSkillPlannerData } from "@/lib/actions/skillPlanner-action";
import { notFound } from "next/navigation";
import UpdateForm from "./_components/UpdateUser";
import type { RoadmapSnapshot } from "./_components/CareerGoalsCard";
import type { CareerHero } from "@/lib/api/dashboard";

export default async function Page() {
    const [userData, jobRoles, dashboardResult] = await Promise.all([
        getUserData(),
        getJobRoles(),
        getCareerDashboardData(),
    ]);
    if (!userData.success) {
        throw new Error(userData.message
            || "Failed to fetch user data");
    }
    if (!userData.data) {
        notFound();
    }

    // Reuses the same skill-planner endpoint the Roadmap page runs on — no
    // new API, just read the roadmapProgress that's already computed there
    // for each of the user's target roles.
    const heroRoles: CareerHero[] = dashboardResult.success ? dashboardResult.data.hero : [];
    const plannerResults = await Promise.all(
        heroRoles.map((role) => getSkillPlannerData(role.jobRoleId)),
    );
    const roadmapSnapshots: RoadmapSnapshot[] = heroRoles.map((role, i) => {
        const result = plannerResults[i];
        const progress = result.success ? result.data.roadmapProgress : null;
        return {
            jobRoleId: role.jobRoleId,
            jobRole: role.jobRole,
            completedModules: progress?.completedModules ?? 0,
            totalModules: progress?.totalModules ?? 0,
            progressPercent: progress?.progressPercent ?? 0,
        };
    });

    return (
        <div className="bg-[#F7F8F5]">
            <UpdateForm user={userData.data} jobRoles={jobRoles} roadmapSnapshots={roadmapSnapshots} />
        </div>
    );
}