"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Building2, Clock, ExternalLink, MapPin, Wallet, X } from "lucide-react";
import type { JobCardProps } from "./JobCard";

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: JobCardProps;
}

// Descriptions are stripped of HTML at scrape time now (see models.py on
// the ai-services side), but this is a defensive fallback for anything
// scraped before that fix, or entered manually via the admin panel.
function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function JobDetailModal({ open, onClose, job }: JobDetailModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Portalled to <body> so "fixed" is relative to the real viewport, not a
  // transformed ancestor (e.g. the page's stagger-entrance wrapper).
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
              {job.match}
            </span>
            <h2 className="mt-3 text-[20px] font-semibold leading-tight text-zinc-900">
              {job.title}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              <Building2 size={14} />
              {job.company}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            {job.location}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1.5">
              <Wallet size={14} />
              {job.salary}
            </span>
          )}
          {(job.employmentType || job.experience) && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} />
              {[job.employmentType, job.experience].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Skills
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Description
            </p>
            <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-zinc-600">
              {stripHtml(job.description)}
            </p>
          </div>
        )}

        <div className="mt-7 border-t border-zinc-100 pt-5">
          {job.applyLink ? (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:opacity-90"
            >
              View Posting / Apply
              <ExternalLink size={14} />
            </a>
          ) : (
            <p className="text-center text-sm text-zinc-400">No listing link available</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
