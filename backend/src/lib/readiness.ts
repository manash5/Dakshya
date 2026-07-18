// Pure readiness-formula functions — no DB access, no orchestration. Kept
// separate from UserProgressService/DashboardService (which decide *when*
// to call these and what to do if data is missing) so the formula itself
// is isolated, reusable, and can't silently take down unrelated work the
// way it used to when it lived as private methods inside one big
// all-or-nothing loop.

export interface ReadinessKnowledgeInput {
  requiredSkills: string[];
  roadmap: { requiredSkills: string[] }[];
}

// Every skill mentioned anywhere in a role's CareerKnowledge — its
// top-level requiredSkills plus whatever each roadmap step calls for.
export function extractRequiredSkills(knowledge: ReadinessKnowledgeInput): string[] {
  const skills = new Set<string>();

  knowledge.requiredSkills.forEach((skill) => skills.add(skill.toLowerCase()));
  knowledge.roadmap.forEach((step) => {
    step.requiredSkills.forEach((skill) => skills.add(skill.toLowerCase()));
  });

  return [...skills];
}

export function calculateMissingSkills(
  requiredSkills: string[],
  acquiredSkills: string[],
): string[] {
  const acquired = new Set(acquiredSkills.map((skill) => skill.toLowerCase()));
  return requiredSkills.filter((skill) => !acquired.has(skill));
}

// Readiness = (skills the person has) / (skills the role needs), as a
// percentage. Skills the person "has" are whatever isn't in missingSkills.
export function calculateReadinessScore(
  requiredSkills: string[],
  missingSkills: string[],
): number {
  if (requiredSkills.length === 0) {
    return 0;
  }

  const matchedSkills = requiredSkills.length - missingSkills.length;
  return Math.round((matchedSkills / requiredSkills.length) * 100);
}

const READINESS_LABELS: { max: number; label: string }[] = [
  { max: 25, label: "Very Low" },
  { max: 50, label: "Needs Improvement" },
  { max: 70, label: "Average" },
  { max: 90, label: "Above Average" },
  { max: 100, label: "Interview Ready" },
];

export function getReadinessLabel(score: number): string {
  const bucket = READINESS_LABELS.find((entry) => score <= entry.max);
  return bucket?.label ?? "Interview Ready";
}
