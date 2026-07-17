"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock, GitBranch, X } from "lucide-react";
import type { Project } from "@/lib/api/project";

const DIFFICULTY_STYLES: Record<Project["difficulty"], string> = {
  Beginner: "bg-[#D9F24A] text-zinc-900",
  Intermediate: "bg-amber-400 text-zinc-900",
  Advanced: "bg-red-500 text-white",
};

interface ProjectDetailModalProps {
  project: Project | null;
  isCompleted: boolean;
  isPending: boolean;
  onClose: () => void;
  onMarkComplete: (githubLink: string) => void;
}

export default function ProjectDetailModal({
  project,
  isCompleted,
  isPending,
  onClose,
  onMarkComplete,
}: ProjectDetailModalProps) {
  const [githubLink, setGithubLink] = useState("");

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  useEffect(() => {
    setGithubLink("");
  }, [project?._id]);

  if (!project) return null;

  const canMarkComplete = githubLink.trim().length > 0;

  return (
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${DIFFICULTY_STYLES[project.difficulty]}`}
            >
              {project.difficulty.toUpperCase()}
            </span>
            <h2 className="mt-2 text-xl font-bold text-zinc-900">{project.title}</h2>
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

        <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
          ~{project.estimatedHours} hours
        </p>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-400">WHAT YOU&apos;LL BUILD</p>
          <p className="text-sm leading-relaxed text-zinc-700">{project.description}</p>
        </div>

        {project.requirements.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-400">REQUIREMENTS</p>
            <ul className="flex flex-col gap-2">
              {project.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5C8A1C]" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-400">SKILLS YOU&apos;LL USE</p>
          <div className="flex flex-wrap gap-2">
            {project.skills.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {!isCompleted && (
          <div className="mt-5 border-t border-zinc-100 pt-5">
            <label htmlFor="project-github-link" className="mb-2 block text-xs font-semibold tracking-wide text-zinc-400">
              SUBMIT YOUR GITHUB LINK
            </label>
            <div className="relative">
              <GitBranch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="project-github-link"
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/you/your-project"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
              />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              Add a link to your finished repo before you can mark this project complete.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-5">
          {project.githubTemplate && (
            <a
              href={project.githubTemplate}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
            >
              Start Project <ArrowRight size={14} />
            </a>
          )}
          <button
            type="button"
            disabled={isCompleted || isPending || !canMarkComplete}
            onClick={() => onMarkComplete(githubLink.trim())}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompleted ? "Completed" : isPending ? "Marking…" : "Mark Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
