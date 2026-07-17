"use client";

import { useState } from "react";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";
import AttemptDetailModal from "./AttemptDetailModal";

function statusFor(attempt: PracticeAttempt): { label: string; className: string } {
  if (!attempt.completedAt) {
    return { label: "IN PROGRESS", className: "bg-zinc-100 text-zinc-600" };
  }
  const score = attempt.overallScore ?? 0;
  if (score >= 85) return { label: "EXCELLENT", className: "bg-[#D9F24A] text-zinc-900" };
  if (score >= 70) return { label: "PASSED", className: "bg-zinc-100 text-zinc-600" };
  return { label: "REVIEW REQ", className: "bg-red-50 text-red-500" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface PracticeHistoryTableProps {
  attempts: PracticeAttempt[];
}

export default function PracticeHistoryTable({ attempts }: PracticeHistoryTableProps) {
  const rows = attempts.slice(0, 8);
  const [selected, setSelected] = useState<PracticeAttempt | null>(null);

  return (
    <div className="flex flex-col rounded-[24px] border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-semibold text-zinc-900">Recent Sessions</h2>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-zinc-400">
          No practice attempts yet — start a session above.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_1.6fr_0.8fr_1fr] gap-4 border-y border-zinc-100 bg-zinc-50/60 px-6 py-3 text-[11px] font-semibold tracking-wide text-zinc-400">
            <span>DATE</span>
            <span>ROLE / SKILL</span>
            <span>SCORE</span>
            <span>STATUS</span>
          </div>

          <div className="flex flex-col">
            {rows.map((attempt) => {
              const status = statusFor(attempt);
              const skillLabel =
                attempt.skill ??
                (attempt.skills.length > 0 ? attempt.skills.join(", ") : null) ??
                attempt.questions[0]?.skills[0] ??
                null;
              const isViewable = !!attempt.completedAt;

              return (
                <button
                  key={attempt._id}
                  type="button"
                  disabled={!isViewable}
                  onClick={() => setSelected(attempt)}
                  className={`grid grid-cols-[1fr_1.6fr_0.8fr_1fr] items-center gap-4 border-b border-zinc-100 px-6 py-5 text-left last:border-b-0 ${
                    isViewable ? "transition hover:bg-zinc-50/60" : "cursor-default"
                  }`}
                >
                  <span className="text-sm text-zinc-500">{formatDate(attempt.createdAt)}</span>
                  <span className="truncate text-sm font-semibold text-zinc-900">
                    {attempt.jobRoleId.title}
                    {skillLabel && (
                      <span className="ml-1 font-normal text-zinc-400">· {skillLabel}</span>
                    )}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      (attempt.overallScore ?? 0) < 70 ? "text-red-500" : "text-zinc-900"
                    }`}
                  >
                    {attempt.overallScore !== null ? `${attempt.overallScore}%` : "—"}
                  </span>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <AttemptDetailModal attempt={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
