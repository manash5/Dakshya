import type { Project } from "@/lib/api/project";
import type { SkillPlanner } from "@/lib/api/skillPlanner";

export interface RecommendedProject {
    project: Project;
    matchedGapSkills: string[];
}

const RECOMMENDATION_LIMIT = 3;

// Proactively surfaces projects the user hasn't done yet that would close
// their real skill gaps -- computed entirely from data already fetched for
// the Practice page (planners across every target role, the project
// catalog for those roles), no new collection or endpoint. A skill counts
// as a "gap" using the same gapSeverity tier the Skill Planner already
// computes server-side, so this stays consistent with what the rest of the
// app calls a gap rather than inventing a second threshold.
export function buildProjectRecommendations(
    planners: SkillPlanner[],
    projects: Project[],
    completedProjectTitles: string[],
): RecommendedProject[] {
    const gapSkills = new Set(
        planners.flatMap((p) =>
            p.skills.filter((s) => s.gapSeverity === "high").map((s) => s.skill.toLowerCase()),
        ),
    );

    const completed = new Set(completedProjectTitles.map((t) => t.toLowerCase()));

    if (gapSkills.size === 0) {
        return [];
    }

    return projects
        .filter((project) => !completed.has(project.title.toLowerCase()))
        .map((project) => ({
            project,
            matchedGapSkills: project.skills.filter((s) => gapSkills.has(s.toLowerCase())),
        }))
        .filter((r) => r.matchedGapSkills.length > 0)
        .sort((a, b) => b.matchedGapSkills.length - a.matchedGapSkills.length)
        .slice(0, RECOMMENDATION_LIMIT);
}
