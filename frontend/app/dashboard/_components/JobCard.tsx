"use client";
import { useState } from "react";
import { Bookmark, Briefcase, Building2, MapPin } from "lucide-react";
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
  const {
    match,
    title,
    company,
    location,
    salary,
    employmentType,
    requiredSkills,
    saved = false,
    onToggleSave,
  } = props;
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <article className="flex flex-col rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:border-zinc-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white">
              <Building2 size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold leading-tight text-zinc-900">{title}</h3>
              <p className="truncate text-sm text-zinc-500">{company}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
            {match}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {location}
          </span>
          {employmentType && (
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {employmentType}
            </span>
          )}
        </div>

        {requiredSkills && requiredSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex-1" />

        {salary && <p className="mb-3 text-sm font-semibold text-zinc-900">{salary}</p>}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-900 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            VIEW DETAILS
          </button>

          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D9F24A] text-zinc-900 transition hover:brightness-95"
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </article>

      <JobDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} job={props} />
    </>
  );
}
