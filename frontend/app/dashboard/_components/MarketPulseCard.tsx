import { ArrowRight, MoveUpRight } from "lucide-react";
import type { MarketPulse } from "@/lib/api/dashboard";

interface MarketPulseCardProps {
  marketPulse: MarketPulse[];
}

export default function MarketPulseCard({ marketPulse }: MarketPulseCardProps) {
  const maxJobs = Math.max(1, ...marketPulse.map((role) => role.jobCount));

  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold tracking-[0.16em] text-zinc-900">
          MARKET PULSE
        </h3>
        <MoveUpRight size={16} className="text-zinc-500" />
      </div>

      <div className="mt-5 space-y-5">
        {marketPulse.length === 0 ? (
          <p className="text-[13px] text-zinc-500">
            Pick a target career to see live job market data.
          </p>
        ) : (
          marketPulse.map((role) => (
            <div key={role.jobRoleId}>
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <span className="text-zinc-700">{role.jobRole}</span>
                <span className="font-semibold text-zinc-800">{role.jobCount} Jobs</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100">
                <div
                  className="h-1.5 rounded-full bg-[#1E7B52]"
                  style={{ width: `${Math.max(6, Math.round((role.jobCount / maxJobs) * 100))}%` }}
                />
              </div>
              {role.topCompanies.length > 0 && (
                <p className="mt-2 text-[11px] text-zinc-400">
                  Top Hiring: {role.topCompanies.join(", ")}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <button className="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-zinc-900">
          VIEW FULL MARKET REPORT
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
