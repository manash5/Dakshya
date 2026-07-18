"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { handleCompleteProject } from "@/lib/actions/userProgress-action";
import type { Project } from "@/lib/api/project";
import type { RecommendedProject } from "@/lib/utils/projectRecommendation";
import ProjectDetailModal from "./ProjectDetailModal";

const DIFFICULTY_STYLES: Record<Project["difficulty"], string> = {
  Beginner: "bg-[#EAF6C8] text-[#3F5B0F]",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700",
};

interface ProjectLearningSectionProps {
  heroRoles: { jobRoleId: string; jobRole: string }[];
  projects: Project[];
  completedProjectTitles: string[];
  recommendations: RecommendedProject[];
}

export default function ProjectLearningSection({
  heroRoles,
  projects,
  completedProjectTitles,
  recommendations,
}: ProjectLearningSectionProps) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedProjectTitles.map((t) => t.toLowerCase())),
  );
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);

  // Only show tabs for roles that actually have projects, in the same order
  // as the user's target roles.
  const availableRoles = heroRoles.filter((role) =>
    projects.some((p) => p.careerRole?._id === role.jobRoleId),
  );

  const visibleProjects = activeRoleId
    ? projects.filter((p) => p.careerRole?._id === activeRoleId)
    : projects;

  const markComplete = (project: Project, githubLink?: string) => {
    setError("");
    setPendingTitle(project.title);
    startTransition(async () => {
      const result = await handleCompleteProject(project.careerRole._id, project.title, githubLink);
      setPendingTitle(null);
      if (result.success) {
        setCompleted((prev) => new Set(prev).add(project.title.toLowerCase()));
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
          No projects available for your target roles yet.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      {recommendations.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={15} className="text-lime-700" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-500">
              RECOMMENDED FOR YOUR SKILL GAPS
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map(({ project, matchedGapSkills }) => (
              <article
                key={project._id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedProject(project);
                  }
                }}
                className="flex cursor-pointer flex-col rounded-[24px] border border-lime-200 bg-lime-50/40 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${DIFFICULTY_STYLES[project.difficulty]}`}
                  >
                    {project.difficulty.toUpperCase()}
                  </span>
                  <span className="rounded-full bg-lime-200 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-lime-900">
                    CLOSES {matchedGapSkills.length} GAP{matchedGapSkills.length === 1 ? "" : "S"}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-semibold text-zinc-900">{project.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500">{project.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {matchedGapSkills.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-lime-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-lime-200/70 pt-4">
                  <span className="text-xs font-medium text-zinc-500">{project.careerRole?.title}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                    View Details <ArrowRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">Project-Based Learning</h2>

        {availableRoles.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveRoleId(null)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeRoleId === null
                  ? "bg-neutral-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              All
            </button>
            {availableRoles.map((role) => (
              <button
                key={role.jobRoleId}
                type="button"
                onClick={() => setActiveRoleId(role.jobRoleId)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeRoleId === role.jobRoleId
                    ? "bg-neutral-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {role.jobRole}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => {
          const isCompleted = completed.has(project.title.toLowerCase());

          return (
            <article
              key={project._id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedProject(project);
                }
              }}
              className="flex cursor-pointer flex-col rounded-[24px] border border-zinc-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${DIFFICULTY_STYLES[project.difficulty]}`}
                >
                  {project.difficulty.toUpperCase()}
                </span>
                {isCompleted ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-700">
                    COMPLETED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                    <Clock size={12} />
                    {project.estimatedHours}h
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-base font-semibold text-zinc-900">{project.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500">{project.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.skills.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
                <span className="text-xs font-medium text-zinc-400">{project.careerRole?.title}</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-zinc-900">
                  View Details <ArrowRight size={14} />
                </span>
              </div>
            </article>
          );
        })}
      </div>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        isCompleted={selectedProject ? completed.has(selectedProject.title.toLowerCase()) : false}
        isPending={isPending && pendingTitle === selectedProject?.title}
        onClose={() => setSelectedProject(null)}
        onMarkComplete={(githubLink) => selectedProject && markComplete(selectedProject, githubLink)}
      />
    </section>
  );
}
