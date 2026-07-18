import { ChartNoAxesColumn, Newspaper, Sparkles, Trophy, Wallet } from "lucide-react";
import type { SalaryRange } from "@/lib/api/dashboard";

interface SalaryRangeCardProps {
  salaryRange: SalaryRange;
}

export function SalaryRangeCard({ salaryRange }: SalaryRangeCardProps) {
  const chipLabel =
    salaryRange.levelLabel && salaryRange.jobRole
      ? `${salaryRange.levelLabel} ${salaryRange.jobRole}`.toUpperCase()
      : null;

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6FAE8] text-zinc-700">
          <Wallet size={15} />
        </div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-500">
          EXPECTED SALARY RANGE
        </p>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <h3 className="text-[28px] font-semibold leading-none tracking-tight text-zinc-900">
          {salaryRange.formatted}
        </h3>
        {salaryRange.min !== null && (
          <span className="pb-0.5 text-[11px] font-medium text-zinc-400">/ MONTH</span>
        )}
      </div>

      <div className="mt-6 flex-1 border-t border-zinc-100 pt-5">
        {chipLabel ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F6FAE8] px-4 py-2.5 text-xs font-semibold text-zinc-900">
            <ChartNoAxesColumn size={14} />
            {chipLabel}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">Level data unavailable</p>
        )}
      </div>
    </article>
  );
}

export interface OpportunityCardItem {
  _id: string;
  title: string;
  organizer: string;
  category: string | null;
  eventDate: string | null;
  registrationLink: string;
}

interface OpportunitiesCardProps {
  opportunities: OpportunityCardItem[];
}

// Real scraped hackathons/workshops/competitions (see ai-services'
// opportunity module + Express's opportunity.service.ts) — replaces what
// used to be hardcoded fake news items in this slot.
export function OpportunitiesCard({ opportunities }: OpportunitiesCardProps) {
  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold tracking-[0.14em] text-zinc-900">
          OPPORTUNITIES
        </h3>
        <Sparkles size={16} className="text-zinc-500" />
      </div>

      {opportunities.length === 0 ? (
        <p className="mt-6 text-[13px] text-zinc-500">
          No upcoming hackathons, workshops or competitions found right now — check back soon.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {opportunities.map((item) => {
            const Icon = item.category?.toLowerCase().includes("hackathon") ? Trophy : Newspaper;

            return (
              <a
                key={item._id}
                href={item.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold leading-5 text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] font-medium tracking-wide text-zinc-500">
                    {[item.organizer, item.eventDate].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
}
