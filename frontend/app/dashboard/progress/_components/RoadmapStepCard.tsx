import { Check, CircleDot, Hourglass, Lock, PlayCircle } from "lucide-react";
import type { SkillPlannerRoadmapStep } from "@/lib/api/skillPlanner";
import type { RichStepStatus } from "./stepStatus";

interface RoadmapStepCardProps {
  step: SkillPlannerRoadmapStep;
  richStatus: RichStepStatus;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  RichStepStatus,
  { label: string; marker: string; labelClass: string; icon: typeof Check }
> = {
  locked: {
    label: "Locked",
    marker: "bg-neutral-100 text-neutral-400",
    labelClass: "text-neutral-400",
    icon: Lock,
  },
  available: {
    label: "Available",
    marker: "border-2 border-neutral-200 bg-white text-neutral-400",
    labelClass: "text-neutral-400",
    icon: CircleDot,
  },
  "in-progress": {
    label: "In Progress",
    marker: "border-2 border-[#C6EA5D] bg-white text-[#5C8A1C]",
    labelClass: "text-[#5C8A1C]",
    icon: Hourglass,
  },
  ready: {
    label: "Ready to Complete",
    marker: "bg-[#C6EA5D] text-neutral-900",
    labelClass: "text-[#5C8A1C]",
    icon: PlayCircle,
  },
  done: {
    label: "Completed",
    marker: "bg-[#2F5D2A] text-white",
    labelClass: "text-[#2F5D2A]",
    icon: Check,
  },
};

export default function RoadmapStepCard({ step, richStatus, onClick }: RoadmapStepCardProps) {
  const isLocked = richStatus === "locked";
  const config = STATUS_CONFIG[richStatus];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={`flex w-full flex-col items-start gap-2 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm transition-shadow duration-200 ${
        isLocked ? "cursor-not-allowed opacity-60" : "hover:shadow-md"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.marker}`}>
          <Icon className="h-4 w-4" strokeWidth={richStatus === "done" ? 3 : 2} />
        </span>
        <span className={`text-[11px] font-semibold tracking-wide ${config.labelClass}`}>
          {config.label.toUpperCase()}
        </span>
      </div>

      <h3 className={`text-sm font-bold ${isLocked ? "text-neutral-400" : "text-neutral-900"}`}>
        {step.title}
      </h3>
      <p className="text-xs text-neutral-400">
        ~{step.estimatedWeeks} week{step.estimatedWeeks === 1 ? "" : "s"}
      </p>
    </button>
  );
}
