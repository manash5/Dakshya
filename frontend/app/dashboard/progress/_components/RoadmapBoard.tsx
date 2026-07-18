"use client";

import { useState } from "react";
import type {
  RoadmapProgress,
  SkillPlannerRoadmapStep,
  SkillPlannerSkill,
} from "@/lib/api/skillPlanner";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";
import RoadmapStepCard from "./RoadmapStepCard";
import RoadmapStepDrawer from "./RoadmapStepDrawer";
import { bucketRoadmapIntoMilestones, findCurrentMilestoneIndex } from "./milestones";
import { computeRichStatus } from "./stepStatus";

interface RoadmapBoardProps {
  roadmap: SkillPlannerRoadmapStep[];
  roadmapProgress: RoadmapProgress;
  skills: SkillPlannerSkill[];
  attempts: PracticeAttempt[];
  jobRoleId: string;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export default function RoadmapBoard({
  roadmap,
  roadmapProgress,
  skills,
  attempts,
  jobRoleId,
}: RoadmapBoardProps) {
  const [justCompletedOrders, setJustCompletedOrders] = useState<Set<number>>(new Set());
  const [selectedStepOrder, setSelectedStepOrder] = useState<number | null>(null);
  const [selectedMilestoneLabel, setSelectedMilestoneLabel] = useState("");

  if (roadmap.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-400">
        No roadmap available for this role yet.
      </div>
    );
  }

  const milestones = bucketRoadmapIntoMilestones(roadmap);
  const currentMilestoneIndex = findCurrentMilestoneIndex(milestones);
  const currentMilestone = milestones[currentMilestoneIndex];
  const currentMilestoneDone = currentMilestone.steps.filter(
    (s) => s.status === "done" || justCompletedOrders.has(s.order),
  ).length;

  const completedModules = roadmapProgress.completedModules + justCompletedOrders.size;
  const totalModules = roadmapProgress.totalModules;
  const progressPercent =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const remaining = Math.max(totalModules - completedModules, 0);
  const weeksLeft = roadmap
    .filter((s) => s.status !== "done" && !justCompletedOrders.has(s.order))
    .reduce((sum, s) => sum + s.estimatedWeeks, 0);

  const selectedStep = roadmap.find((s) => s.order === selectedStepOrder) ?? null;
  const selectedStepIsDone =
    selectedStep !== null &&
    (selectedStep.status === "done" || justCompletedOrders.has(selectedStep.order));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="COMPLETE" value={`${progressPercent}%`} />
        <StatTile label="STEPS DONE" value={`${completedModules}/${totalModules}`} />
        <StatTile label="REMAINING" value={`${remaining}`} />
        <StatTile label="WEEKS LEFT" value={`${weeksLeft}`} />
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-neutral-900">
            Current milestone: <span className="text-[#5C8A1C]">{currentMilestone.label}</span>
          </p>
          <p className="text-neutral-400">
            {currentMilestoneDone} of {currentMilestone.steps.length} completed
          </p>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-[#7FB519]"
            style={{
              width: `${
                currentMilestone.steps.length > 0
                  ? Math.round((currentMilestoneDone / currentMilestone.steps.length) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      <div className="p-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-10">
          {milestones.map((milestone, i) => (
            <div key={milestone.label} className="relative flex gap-5">
              <div className="relative flex shrink-0 flex-col items-center">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i === currentMilestoneIndex
                      ? "bg-[#C6EA5D] text-neutral-900"
                      : i < currentMilestoneIndex
                        ? "bg-[#2F5D2A] text-white"
                        : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {i + 1}
                </span>
                {i !== milestones.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-neutral-200" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-2">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${
                    i === currentMilestoneIndex
                      ? "bg-[#C6EA5D] text-neutral-900"
                      : "bg-[#F2F3EE] text-neutral-500"
                  }`}
                >
                  {milestone.label.toUpperCase()}
                </span>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {milestone.steps.map((step) => {
                    const isDone = step.status === "done" || justCompletedOrders.has(step.order);
                    const richStatus = computeRichStatus(step, skills, attempts, isDone);

                    return (
                      <RoadmapStepCard
                        key={step.order}
                        step={step}
                        richStatus={richStatus}
                        onClick={() => {
                          setSelectedStepOrder(step.order);
                          setSelectedMilestoneLabel(milestone.label);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RoadmapStepDrawer
        step={selectedStep}
        milestoneLabel={selectedMilestoneLabel}
        skills={skills}
        attempts={attempts}
        jobRoleId={jobRoleId}
        isDone={selectedStepIsDone}
        onClose={() => setSelectedStepOrder(null)}
        onCompleted={(stepOrder) =>
          setJustCompletedOrders((prev) => new Set(prev).add(stepOrder))
        }
      />
    </div>
  );
}
