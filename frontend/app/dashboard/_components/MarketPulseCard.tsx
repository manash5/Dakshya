"use client";
import { useState } from "react";
import { ArrowRight, MoveUpRight } from "lucide-react";
import type { MarketPulse, SkillDemand } from "@/lib/api/dashboard";
import MarketReportModal from "./MarketReportModal";

interface MarketPulseCardProps {
  marketPulse: MarketPulse;
}

const TOP_SKILLS_LIMIT = 3;

export default function MarketPulseCard({ marketPulse }: MarketPulseCardProps) {
  const { totalJobs, skills } = marketPulse;
  const [reportOpen, setReportOpen] = useState(false);
  const topSkills = skills.slice(0, TOP_SKILLS_LIMIT);

  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold tracking-[0.16em] text-zinc-900">
          MARKET PULSE
        </h3>
        <MoveUpRight size={16} className="text-zinc-500" />
      </div>

      {skills.length > 0 && (
        <p className="mt-2 text-[12px] text-zinc-400">
          {totalJobs > 0
            ? `Demand across ${totalJobs} live jobs matching your target roles`
            : "No live postings this week for your target roles"}
        </p>
      )}

      <div className="mt-5 space-y-5">
        {skills.length === 0 ? (
          <p className="text-[13px] text-zinc-500">
            Pick a target career and complete subjects to see which of your skills are in demand.
          </p>
        ) : (
          topSkills.map((entry) => (
            <SkillDemandRow key={entry.skill} entry={entry} totalJobs={totalJobs} />
          ))
        )}
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          disabled={skills.length === 0}
          className="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-zinc-900 disabled:opacity-40"
        >
          VIEW MORE
          <ArrowRight size={16} />
        </button>
      </div>

      <MarketReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        marketPulse={marketPulse}
      />
    </article>
  );
}

function SkillDemandRow({ entry, totalJobs }: { entry: SkillDemand; totalJobs: number }) {
  const pct = totalJobs > 0 ? Math.round((entry.jobCount / totalJobs) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="text-zinc-700">{entry.skill}</span>
        <span className="font-semibold text-zinc-800">
          {totalJobs > 0 ? `${entry.jobCount} / ${totalJobs} jobs` : "0 jobs"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100">
        <div
          className="h-1.5 rounded-full bg-[#1E7B52]"
          style={{ width: `${entry.jobCount > 0 ? Math.max(6, pct) : 0}%` }}
        />
      </div>
    </div>
  );
}
