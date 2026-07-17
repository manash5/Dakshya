import type { SkillPlannerRoadmapStep, SkillPlannerSkill } from "@/lib/api/skillPlanner";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";

export const MIN_QUALIFYING_QUESTIONS = 15;
export const MIN_QUALIFYING_SESSIONS = 5;

export type RichStepStatus = "locked" | "available" | "in-progress" | "ready" | "done";

// Real states derived entirely from data already tracked (resources
// watched + qualifying practice sessions) -- no new persisted concept.
export function computeStepEvidence(
  step: SkillPlannerRoadmapStep,
  skills: SkillPlannerSkill[],
  attempts: PracticeAttempt[],
  watchedResourceUrlsOverride?: string[],
) {
  const stepSkillsLower = new Set(step.requiredSkills.map((s) => s.toLowerCase()));
  const matchedSkills = skills.filter((s) => stepSkillsLower.has(s.skill));

  const resourceMap = new Map<string, { url: string }>();
  matchedSkills.forEach((s) => s.resources.forEach((r) => resourceMap.set(r.url, r)));
  const totalResources = resourceMap.size;

  const watchedUrls = watchedResourceUrlsOverride ?? step.watchedResourceUrls;
  const resourcesWatched = Array.from(resourceMap.keys()).filter((url) =>
    watchedUrls.includes(url),
  ).length;
  const allResourcesWatched = totalResources === 0 || resourcesWatched === totalResources;

  const qualifyingSessions = attempts.filter(
    (a) =>
      a.completedAt !== null &&
      a.questionCount >= MIN_QUALIFYING_QUESTIONS &&
      a.questions.some((q) => q.skills.some((s) => stepSkillsLower.has(s.toLowerCase()))),
  ).length;
  const practiceMet = qualifyingSessions >= MIN_QUALIFYING_SESSIONS;

  return { totalResources, resourcesWatched, allResourcesWatched, qualifyingSessions, practiceMet };
}

export function computeRichStatus(
  step: SkillPlannerRoadmapStep,
  skills: SkillPlannerSkill[],
  attempts: PracticeAttempt[],
  isDone: boolean,
): RichStepStatus {
  if (isDone) return "done";
  if (step.status === "locked") return "locked";

  const { resourcesWatched, qualifyingSessions, allResourcesWatched, practiceMet } =
    computeStepEvidence(step, skills, attempts);

  if (allResourcesWatched && practiceMet) return "ready";
  if (resourcesWatched > 0 || qualifyingSessions > 0) return "in-progress";
  return "available";
}
