"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { MarketPulse, SkillDemand } from "@/lib/api/dashboard";

interface MarketReportModalProps {
  open: boolean;
  onClose: () => void;
  marketPulse: MarketPulse;
}

export default function MarketReportModal({ open, onClose, marketPulse }: MarketReportModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const { totalJobs, skills } = marketPulse;

  // Portalled to <body> so "fixed" is relative to the real viewport, not a
  // transformed ancestor (e.g. the page's stagger-entrance wrapper).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[24px] bg-white p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-zinc-900">Full Market Report</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        {skills.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            Pick a target career and complete subjects to see which of your skills are in demand.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-zinc-500">
              {totalJobs > 0
                ? `Out of ${totalJobs} live jobs matching your target roles, here's how many need each skill you have.`
                : "No live postings this week for your target roles."}
            </p>

            <div className="mt-6 space-y-4">
              {skills.map((entry) => (
                <SkillDemandRow key={entry.skill} entry={entry} totalJobs={totalJobs} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

function SkillDemandRow({ entry, totalJobs }: { entry: SkillDemand; totalJobs: number }) {
  const pct = totalJobs > 0 ? Math.round((entry.jobCount / totalJobs) * 100) : 0;

  return (
    <div className="rounded-2xl border border-zinc-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-zinc-900">{entry.skill}</h3>
        <span className="shrink-0 text-sm font-semibold text-zinc-700">
          {totalJobs > 0 ? `${entry.jobCount} / ${totalJobs} jobs` : "0 jobs"}
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-100">
        <div
          className="h-1.5 rounded-full bg-[#1E7B52]"
          style={{ width: `${entry.jobCount > 0 ? Math.max(6, pct) : 0}%` }}
        />
      </div>
    </div>
  );
}
