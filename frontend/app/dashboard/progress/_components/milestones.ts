import type { SkillPlannerRoadmapStep } from "@/lib/api/skillPlanner";

export interface RoadmapMilestone {
  label: string;
  steps: SkillPlannerRoadmapStep[];
}

const MILESTONE_LABELS = ["Foundations", "Core", "Advanced", "Job Ready"];

// CareerKnowledge.roadmap has no phase/milestone field today — this buckets
// the already-ordered steps into even, position-based groups purely for
// display, rather than requiring a schema + AI-prompt change.
export function bucketRoadmapIntoMilestones(
  roadmap: SkillPlannerRoadmapStep[],
): RoadmapMilestone[] {
  if (roadmap.length === 0) return [];

  const sorted = [...roadmap].sort((a, b) => a.order - b.order);
  const numGroups = Math.min(MILESTONE_LABELS.length, sorted.length);
  const base = Math.floor(sorted.length / numGroups);
  const remainder = sorted.length % numGroups;

  const milestones: RoadmapMilestone[] = [];
  let index = 0;
  for (let i = 0; i < numGroups; i++) {
    const size = base + (i < remainder ? 1 : 0);
    milestones.push({
      label: MILESTONE_LABELS[i],
      steps: sorted.slice(index, index + size),
    });
    index += size;
  }
  return milestones;
}

// The milestone containing the first "current" step, or the last milestone
// if every step is already done (or none are current, e.g. all locked).
export function findCurrentMilestoneIndex(milestones: RoadmapMilestone[]): number {
  const idx = milestones.findIndex((m) => m.steps.some((s) => s.status === "current"));
  return idx !== -1 ? idx : milestones.length - 1;
}
