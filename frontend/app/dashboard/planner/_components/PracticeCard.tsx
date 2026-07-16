import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import RingGauge from "../../_components/RingGauge";
import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";

interface PracticeCardProps {
  selectedSkill: SkillPlannerSkill | null;
  jobRoleId: string;
}

export default function PracticeCard({ selectedSkill, jobRoleId }: PracticeCardProps) {
  const interviewHref = selectedSkill
    ? `/dashboard/practice/interview?jobRoleId=${jobRoleId}&skill=${encodeURIComponent(selectedSkill.skill)}&skillLabel=${encodeURIComponent(selectedSkill.displayName)}`
    : `/dashboard/practice/interview?jobRoleId=${jobRoleId}`;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-neutral-400">PRACTICE</p>
        {selectedSkill && (
          <span className="rounded-full bg-[#F2F3EE] px-2.5 py-1 text-xs font-medium text-neutral-600">
            {selectedSkill.displayName}
          </span>
        )}
      </div>

      {!selectedSkill ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          No required skills found for this role yet.
        </p>
      ) : selectedSkill.practice.attempted ? (
        <>
          <div className="flex justify-center">
            <RingGauge
              value={`${selectedSkill.practice.bestScore}%`}
              label="BEST SCORE"
              diameter={140}
              viewBoxSize={200}
              radius={80}
              strokeWidth={16}
              trackStroke="#EBECE6"
              progressStroke={(selectedSkill.practice.bestScore ?? 0) >= 70 ? "#7FB519" : "#F0B429"}
              progress={selectedSkill.practice.bestScore ?? 0}
              valueClassName="text-xl font-bold text-neutral-900"
              labelClassName="mt-1 text-[10px] font-medium tracking-wide text-neutral-400"
            />
          </div>
          <p className="mt-4 text-center text-sm text-neutral-400">
            Across {selectedSkill.practice.attemptCount} attempt
            {selectedSkill.practice.attemptCount === 1 ? "" : "s"}
          </p>
          <Link
            href={interviewHref}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            <MessageSquare className="h-4 w-4" />
            Practice Again
          </Link>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F3EE] text-neutral-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="text-sm text-neutral-500">
            You haven&apos;t practiced{" "}
            <span className="font-semibold text-neutral-900">{selectedSkill.displayName}</span> in
            an interview yet.
          </p>
          <Link
            href={interviewHref}
            className="mt-1 flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            <MessageSquare className="h-4 w-4" />
            Start Practicing
          </Link>
        </div>
      )}
    </div>
  );
}
