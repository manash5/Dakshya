import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";

// Single source of truth for the skill-scoped interview URL — shared by the
// Skill Planner and Roadmap pages so both jump into the exact same
// skill-scoped interview flow.
export function buildInterviewHref(
    jobRoleId: string,
    skill?: Pick<SkillPlannerSkill, "skill" | "displayName"> | null,
) {
    if (!skill) {
        return `/dashboard/practice/interview?jobRoleId=${jobRoleId}`;
    }
    return `/dashboard/practice/interview?jobRoleId=${jobRoleId}&skill=${encodeURIComponent(skill.skill)}&skillLabel=${encodeURIComponent(skill.displayName)}`;
}
