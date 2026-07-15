"use client";
import { useState } from "react";
import { Bookmark, Building2, MapPin } from "lucide-react";
import JobDetailModal from "./JobDetailModal";

export type JobCardProps = {
  match: string;
  title: string;
  company: string;
  location: string;
  saved?: boolean;
  onToggleSave?: () => void;
  // Optional fuller detail, shown in the overlay when present. Real
  // dashboard data has all of these; job-finder's mock data supplies a
  // matching subset so the same overlay works there too.
  salary?: string;
  experience?: string | null;
  employmentType?: string | null;
  requiredSkills?: string[];
  description?: string;
  applyLink?: string;
};

export default function JobCard(props: JobCardProps) {
  const { match, title, company, location, saved = false, onToggleSave } = props;
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <article className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500">
            <Building2 size={14} />
          </div>
          <span className="rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
            {match}
          </span>
        </div>

        <div className="mt-8 space-y-1">
          <h3 className="text-[16px] font-semibold leading-tight text-zinc-900">
            {title}
          </h3>
          <p className="text-sm text-zinc-500">{company}</p>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500">
          <MapPin size={12} />
          <span>{location}</span>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-zinc-900 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            VIEW DETAILS
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D9F24A] text-zinc-900 transition hover:brightness-95"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </article>

      <JobDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} job={props} />
    </>
  );
}
