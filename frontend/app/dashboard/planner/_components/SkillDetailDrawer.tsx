"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  MessageSquare,
  Newspaper,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { SkillPlannerSkill, SkillPlannerResource } from "@/lib/api/skillPlanner";
import type { Project } from "@/lib/api/project";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { STATUS_INFO } from "./skillStatus";
import { buildInterviewHref } from "@/lib/utils/practiceLink";
import { handleGenerateSkillResources } from "@/lib/actions/skillPlanner-action";

const RESOURCE_TYPE_ICON: Record<SkillPlannerResource["type"], typeof BookOpen> = {
  Course: BookOpen,
  Documentation: FileText,
  Video: Play,
  Article: Newspaper,
};

const RESOURCE_TYPE_STYLES: Record<SkillPlannerResource["type"], string> = {
  Course: "bg-[#EAF1FB] text-[#2E6BB8]",
  Documentation: "bg-[#F2F3EE] text-neutral-500",
  Video: "bg-[#FDEBEB] text-[#D0362A]",
  Article: "bg-[#F1EAFB] text-[#6B3FA0]",
};

function ResourceVideo({ resource, youTubeId }: { resource: SkillPlannerResource; youTubeId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-100">
      <div className="relative aspect-video w-full bg-neutral-900">
        {isPlaying ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1`}
            title={resource.title}
            allow="accelerate; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 block h-full w-full"
            aria-label={`Play ${resource.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail, not an app asset */}
            <img
              src={`https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-0.5 h-4 w-4 fill-neutral-900 text-neutral-900" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${RESOURCE_TYPE_STYLES.Video}`}
        >
          VIDEO
        </span>
        <p className="truncate text-sm font-semibold text-neutral-900">{resource.title}</p>
      </div>
    </div>
  );
}

function EvidenceRow({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          met ? "bg-[#E4F3E1] text-[#2F5D2A]" : "bg-neutral-100 text-neutral-300"
        }`}
      >
        {met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      </span>
      <span className={met ? "text-neutral-700" : "text-neutral-400"}>{children}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold tracking-wide text-neutral-400">{children}</p>
  );
}

interface SkillDetailDrawerProps {
  skill: SkillPlannerSkill | null;
  projects: Project[];
  attempts: PracticeAttempt[];
  jobRoleId: string;
  onClose: () => void;
}

export default function SkillDetailDrawer({
  skill,
  projects,
  attempts,
  jobRoleId,
  onClose,
}: SkillDetailDrawerProps) {
  const [extraResources, setExtraResources] = useState<SkillPlannerResource[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    setExtraResources([]);
    setGenerateError("");
  }, [skill]);

  useEffect(() => {
    if (!skill) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skill, onClose]);

  if (!skill) return null;

  const status = STATUS_INFO[skill.status];
  const resources = [...skill.resources, ...extraResources];

  const handleGenerate = async () => {
    setGenerateError("");
    setIsGenerating(true);
    const result = await handleGenerateSkillResources(jobRoleId, skill.skill);
    setIsGenerating(false);
    if (result.success) {
      setExtraResources((prev) => [...prev, ...result.data]);
    } else {
      setGenerateError(result.message);
    }
  };

  const skillHistory = attempts
    .map((attempt) => {
      const matching = attempt.questions.filter((q) =>
        q.skills.some((s) => s.toLowerCase() === skill.skill),
      );
      if (matching.length === 0) return null;
      const avgScore = Math.round(
        matching.reduce((sum, q) => sum + (q.score ?? 0), 0) / matching.length,
      );
      return {
        id: attempt._id,
        date: attempt.completedAt ?? attempt.startedAt,
        score: avgScore,
      };
    })
    .filter((entry): entry is { id: string; date: string; score: number } => entry !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completedTitles = new Set(skill.project.projectTitles.map((t) => t.toLowerCase()));
  const relatedProjects = projects.filter(
    (p) =>
      p.skills.some((s) => s.toLowerCase() === skill.skill) &&
      !completedTitles.has(p.title.toLowerCase()),
  );

  // Portalled to <body> so "fixed" is relative to the real viewport, not a
  // transformed ancestor (e.g. the page's stagger-entrance wrapper).
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        key="panel"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{skill.displayName}</h2>
            <span
              className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${status.badge}`}
            >
              {status.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Current Level</span>
              <span className="font-semibold text-neutral-600">{skill.proficiency}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[#5C8A1C]"
                style={{ width: `${skill.proficiency}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-neutral-500">{status.description}</p>
          </div>

          <div>
            <SectionLabel>EVIDENCE</SectionLabel>
            <div className="flex flex-col gap-2.5 rounded-xl bg-[#FAFBF6] p-4">
              <EvidenceRow met={skill.curriculum.taught}>
                <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
                {skill.curriculum.taught
                  ? `Found in Degree — Semester ${skill.curriculum.semester}`
                  : "Not in your degree curriculum"}
              </EvidenceRow>
              <EvidenceRow met={skill.sources.includes("resume")}>
                <FileText className="mr-1 inline h-3.5 w-3.5" />
                {skill.sources.includes("resume") ? "Found on Resume" : "Not on Resume"}
              </EvidenceRow>
              <EvidenceRow met={skill.project.applied}>
                <FolderGit2 className="mr-1 inline h-3.5 w-3.5" />
                {skill.project.applied
                  ? `${skill.project.projectTitles.length} Project${skill.project.projectTitles.length === 1 ? "" : "s"}: ${skill.project.projectTitles.join(", ")}`
                  : "No completed projects yet"}
              </EvidenceRow>
              <EvidenceRow met={skill.practice.attempted}>
                <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                {skill.practice.attempted
                  ? `${skill.practice.attemptCount} Practice Session${skill.practice.attemptCount === 1 ? "" : "s"} — best ${skill.practice.bestScore}%`
                  : "No practice sessions yet"}
              </EvidenceRow>
            </div>
          </div>

          <div>
            <SectionLabel>PRACTICE HISTORY</SectionLabel>
            {skillHistory.length === 0 ? (
              <p className="text-sm text-neutral-400">No practice sessions for this skill yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {skillHistory.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm"
                  >
                    <span className="text-neutral-500">
                      Interview #{skillHistory.length - i} ·{" "}
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`font-semibold ${entry.score >= 70 ? "text-[#5C8A1C]" : "text-[#B8860B]"}`}
                    >
                      {entry.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionLabel>PROJECTS USING THIS SKILL</SectionLabel>
            {relatedProjects.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No open projects tag this skill right now.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {relatedProjects.map((project) => (
                  <div
                    key={project._id}
                    className="rounded-lg border border-neutral-100 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-neutral-900">{project.title}</p>
                      <span className="shrink-0 rounded-md bg-[#F2F3EE] px-2 py-0.5 text-xs font-medium text-neutral-500">
                        {project.difficulty}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      ~{project.estimatedHours}h
                      {project.githubTemplate && (
                        <>
                          {" · "}
                          <a
                            href={project.githubTemplate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 hover:underline"
                          >
                            Template <ExternalLink className="h-3 w-3" />
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionLabel>LEARNING RESOURCES</SectionLabel>
            {resources.length > 0 && (
              <div className="mb-3 flex flex-col gap-3">
                {resources.map((resource, i) => {
                  const youTubeId =
                    resource.type === "Video" ? extractYouTubeId(resource.url) : null;
                  const Icon = RESOURCE_TYPE_ICON[resource.type];

                  return youTubeId ? (
                    <ResourceVideo key={`${resource.url}-${i}`} resource={resource} youTubeId={youTubeId} />
                  ) : (
                    <a
                      key={`${resource.url}-${i}`}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-neutral-100 p-3 transition-colors hover:border-[#C6EA5D] hover:bg-[#FAFBF6]"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${RESOURCE_TYPE_STYLES[resource.type]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold tracking-wide text-neutral-400">
                          {resource.type.toUpperCase()}
                        </p>
                        <p className="truncate text-sm font-semibold text-neutral-900 group-hover:underline">
                          {resource.title}
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-300 group-hover:text-neutral-400" />
                    </a>
                  );
                })}
              </div>
            )}

            {resources.length === 0 && (
              <>
                <p className="mb-3 text-sm text-neutral-400">
                  No resources tagged for this skill yet.
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGenerating ? "Generating…" : "Generate resources with AI"}
                </button>
                {generateError && <p className="mb-3 text-xs text-red-500">{generateError}</p>}
              </>
            )}

            {/* Always-available, zero-cost fallback so this section is never
                a dead end even before/without AI generation. */}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${skill.displayName} documentation`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 p-3 transition-colors hover:border-neutral-300 hover:bg-[#FAFBF6]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2F3EE] text-neutral-500">
                <Search className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wide text-neutral-400">SEARCH</p>
                <p className="truncate text-sm font-semibold text-neutral-900 group-hover:underline">
                  {skill.displayName} documentation
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-300 group-hover:text-neutral-400" />
            </a>
          </div>

          <a
            href={buildInterviewHref(jobRoleId, skill)}
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            <MessageSquare className="h-4 w-4" />
            Practice {skill.displayName}
          </a>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
