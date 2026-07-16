"use client";

import { useState, useTransition } from "react";
import { ArrowRight, CircuitBoard, LineChart, MessageSquare } from "lucide-react";
import { handleCompleteProject } from "@/lib/actions/userProgress-action";
import type { Project } from "@/lib/api/project";

const DIFFICULTY_STYLES: Record<Project["difficulty"], string> = {
  Beginner: "bg-[#D9F24A] text-zinc-900",
  Intermediate: "bg-amber-400 text-zinc-900",
  Advanced: "bg-red-500 text-white",
};

const ICONS = [MessageSquare, LineChart, CircuitBoard];

interface ProjectLearningSectionProps {
  jobRoleId: string;
  projects: Project[];
  completedProjectTitles: string[];
}

export default function ProjectLearningSection({
  jobRoleId,
  projects,
  completedProjectTitles,
}: ProjectLearningSectionProps) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedProjectTitles.map((t) => t.toLowerCase())),
  );
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const markComplete = (title: string) => {
    setError("");
    setPendingTitle(title);
    startTransition(async () => {
      const result = await handleCompleteProject(jobRoleId, title);
      setPendingTitle(null);
      if (result.success) {
        setCompleted((prev) => new Set(prev).add(title.toLowerCase()));
      } else {
        setError(result.message);
      }
    });
  };

  if (projects.length === 0) {
    return (
      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-zinc-900">Project-Based Learning</h2>
        <p className="rounded-[20px] border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-400">
          No projects available for this role yet.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Project-Based Learning</h2>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => {
          const Icon = ICONS[i % ICONS.length];
          const isCompleted = completed.has(project.title.toLowerCase());
          const isThisPending = isPending && pendingTitle === project.title;

          return (
            <article
              key={project._id}
              className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
            >
              <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800">
                <span
                  className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${DIFFICULTY_STYLES[project.difficulty]}`}
                >
                  {project.difficulty.toUpperCase()}
                </span>
                {isCompleted && (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
                    COMPLETED
                  </span>
                )}
                <Icon size={40} className="text-zinc-500/70" />
              </div>

              <div className="p-5">
                <h3 className="text-base font-semibold text-zinc-900">{project.title}</h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {project.skills.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-4">
                  {project.githubTemplate && (
                    <a
                      href={project.githubTemplate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-semibold text-zinc-900 transition hover:text-zinc-600"
                    >
                      Start Project <ArrowRight size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={isCompleted || isThisPending}
                    onClick={() => markComplete(project.title)}
                    className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-900 disabled:opacity-50"
                  >
                    {isCompleted ? "Completed" : isThisPending ? "Marking…" : "Mark Complete"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
