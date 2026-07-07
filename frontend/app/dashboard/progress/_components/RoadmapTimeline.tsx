import { Check, Lightbulb, Lock, Play } from "lucide-react";
import type { ReactNode } from "react";
import CapstoneCard from "./CapstoneCard";
import StageCard from "./StageCard";

interface TimelineRowProps {
  marker: ReactNode;
  isLast?: boolean;
  children: ReactNode;
}

function TimelineRow({ marker, isLast, children }: TimelineRowProps) {
  return (
    <div className="relative flex gap-5">
      {!isLast && <span className="absolute left-[17px] top-9 bottom-[-20px] w-px bg-zinc-200" aria-hidden />}
      <div className="relative z-10 shrink-0">{marker}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function RoadmapTimeline() {
  return (
    <div className="flex flex-col gap-5">
      <TimelineRow marker={<CompletedMarker />}>
        <StageCard
          variant="completed"
          eyebrow="FOUNDATION"
          statusLabel="COMPLETED"
          title="Dart Mastery"
          subtitle="OOPs, Null Safety, & Functional Programming"
          progress={100}
          actionLabel="Review Material"
        />
      </TimelineRow>

      <TimelineRow marker={<InProgressMarker />}>
        <StageCard
          variant="in-progress"
          eyebrow="CORE UI"
          statusLabel="IN PROGRESS"
          title="Flutter Framework Fundamentals"
          subtitle="Widgets, Layouts, & Custom Painting"
          progress={75}
          tags={["Animations", "Adaptive UI"]}
          actionLabel="Show skills"
        />
      </TimelineRow>

      <TimelineRow marker={<LockedMarker />}>
        <StageCard
          variant="locked"
          eyebrow="ARCHITECTURE"
          statusLabel="LOCKED"
          title="Advanced State Management"
          subtitle="Riverpod / BLoC Pattern Integration"
          actionLabel="Practice Skill"
          lockedNote="Complete 'Adaptive UI' project to unlock this practice module."
        />
      </TimelineRow>

      <TimelineRow marker={<CapstoneMarker />} isLast>
        <CapstoneCard />
      </TimelineRow>
    </div>
  );
}

function CompletedMarker() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900">
      <Check className="h-4 w-4 text-white" strokeWidth={3} />
    </div>
  );
}

function InProgressMarker() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-lime-400 bg-white">
      <Play className="h-3.5 w-3.5 fill-lime-500 text-lime-500" />
    </div>
  );
}

function LockedMarker() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
      <Lock className="h-3.5 w-3.5 text-zinc-400" />
    </div>
  );
}

function CapstoneMarker() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-300">
      <Lightbulb className="h-4 w-4 text-zinc-900" strokeWidth={2.25} />
    </div>
  );
}