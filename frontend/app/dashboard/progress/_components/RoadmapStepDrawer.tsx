"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  Newspaper,
  Play,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type {
  SkillPlannerRoadmapStep,
  SkillPlannerResource,
  SkillPlannerSkill,
} from "@/lib/api/skillPlanner";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";
import { buildInterviewHref } from "@/lib/utils/practiceLink";
import { handleCompleteRoadmapStep } from "@/lib/actions/userProgress-action";
import { handleGenerateSkillResources } from "@/lib/actions/skillPlanner-action";
import ResourceVideoModal from "./ResourceVideoModal";
import { MIN_QUALIFYING_QUESTIONS, MIN_QUALIFYING_SESSIONS } from "./stepStatus";

const RESOURCE_TYPE_ICON: Record<SkillPlannerResource["type"], typeof BookOpen> = {
  Course: BookOpen,
  Documentation: FileText,
  Video: Play,
  Article: Newspaper,
};

interface RoadmapStepDrawerProps {
  step: SkillPlannerRoadmapStep | null;
  milestoneLabel: string;
  skills: SkillPlannerSkill[];
  attempts: PracticeAttempt[];
  jobRoleId: string;
  isDone: boolean;
  onClose: () => void;
  onCompleted: (stepOrder: number) => void;
}

export default function RoadmapStepDrawer({
  step,
  milestoneLabel,
  skills,
  attempts,
  jobRoleId,
  isDone,
  onClose,
  onCompleted,
}: RoadmapStepDrawerProps) {
  const [watchedResourceUrls, setWatchedResourceUrls] = useState<string[]>([]);
  const [extraResources, setExtraResources] = useState<SkillPlannerResource[]>([]);
  const [activeResource, setActiveResource] = useState<SkillPlannerResource | null>(null);
  const [isCompleting, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [generatingSkill, setGeneratingSkill] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    setWatchedResourceUrls(step?.watchedResourceUrls ?? []);
    setExtraResources([]);
    setError("");
    setGenerateError("");
  }, [step]);

  useEffect(() => {
    if (!step) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !activeResource && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, activeResource, onClose]);

  if (!step) return null;

  const stepSkillsLower = new Set(step.requiredSkills.map((s) => s.toLowerCase()));
  const matchedSkills = skills.filter((s) => stepSkillsLower.has(s.skill));

  const resourceMap = new Map<string, SkillPlannerResource>();
  matchedSkills.forEach((s) => s.resources.forEach((r) => resourceMap.set(r.url, r)));
  extraResources.forEach((r) => resourceMap.set(r.url, r));
  const resources = Array.from(resourceMap.values());

  const skillsWithoutResources = step.requiredSkills
    .map((skill) => {
      const lower = skill.toLowerCase();
      const matched = matchedSkills.find((s) => s.skill === lower);
      return { skill: lower, displayName: matched?.displayName ?? skill };
    })
    .filter(({ skill: lower }) => {
      const hasOriginal = matchedSkills.some(
        (s) => s.skill === lower && s.resources.length > 0,
      );
      const hasGenerated = extraResources.some((r) =>
        r.skills.some((s) => s.toLowerCase() === lower),
      );
      return !hasOriginal && !hasGenerated;
    });

  const handleGenerate = async (skill: string) => {
    setGenerateError("");
    setGeneratingSkill(skill);
    const result = await handleGenerateSkillResources(jobRoleId, skill);
    setGeneratingSkill(null);
    if (result.success) {
      setExtraResources((prev) => [...prev, ...result.data]);
    } else {
      setGenerateError(result.message);
    }
  };

  const resourcesWatched = resources.filter((r) => watchedResourceUrls.includes(r.url)).length;
  const allResourcesWatched = resources.length === 0 || resourcesWatched === resources.length;

  const qualifyingSessions = attempts.filter(
    (a) =>
      a.completedAt !== null &&
      a.questionCount >= MIN_QUALIFYING_QUESTIONS &&
      a.questions.some((q) => q.skills.some((s) => stepSkillsLower.has(s.toLowerCase()))),
  ).length;
  const practiceMet = qualifyingSessions >= MIN_QUALIFYING_SESSIONS;

  const topGapSkill = [...matchedSkills].sort((a, b) => a.proficiency - b.proficiency)[0] ?? null;
  const canComplete = !isDone && allResourcesWatched && practiceMet;

  const handleComplete = () => {
    setError("");
    startTransition(async () => {
      const result = await handleCompleteRoadmapStep(jobRoleId, step.order);
      if (result.success) {
        onCompleted(step.order);
      } else {
        setError(result.message);
      }
    });
  };

  return (
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
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 p-6">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-neutral-400">
              {milestoneLabel.toUpperCase()}
            </p>
            <h2 className="mt-1 text-xl font-bold text-neutral-900">{step.title}</h2>
            <span
              className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
                isDone
                  ? "bg-[#E4F3E1] text-[#2F5D2A]"
                  : "bg-[#E9F7CC] text-[#5C8A1C]"
              }`}
            >
              {isDone ? "Completed" : "In Progress"}
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
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-400">OVERVIEW</p>
            <p className="text-sm leading-relaxed text-neutral-600">{step.description}</p>
            {step.completionCriteria && (
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                <span className="font-semibold text-neutral-700">Research: </span>
                {step.completionCriteria}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#FAFBF6] px-3 py-2.5">
              <Clock className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-neutral-400">EST. TIME</p>
                <p className="text-sm font-semibold text-neutral-900">
                  ~{step.estimatedWeeks} week{step.estimatedWeeks === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#FAFBF6] px-3 py-2.5">
              <Target className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-neutral-400">TYPE</p>
                <p className="text-sm font-semibold text-neutral-900">Skill</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-400">
              SKILLS LEARNED
            </p>
            <div className="flex flex-wrap gap-1.5">
              {step.requiredSkills.map((skill) => {
                const matched = skills.find((s) => s.skill === skill.toLowerCase());
                return (
                  <span
                    key={skill}
                    className="rounded-md bg-[#F2F3EE] px-2.5 py-1 text-xs font-medium text-neutral-600"
                  >
                    {matched?.displayName ?? skill}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-neutral-400">RESOURCES</p>
              <span className="text-xs text-neutral-400">
                {resourcesWatched}/{resources.length} watched
              </span>
            </div>
            {resources.length === 0 && skillsWithoutResources.length === 0 && (
              <p className="text-sm text-neutral-400">No resources tagged for this skill yet.</p>
            )}
            {resources.length > 0 && (
              <div className="flex flex-col gap-2">
                {resources.map((resource) => {
                  const Icon = RESOURCE_TYPE_ICON[resource.type];
                  const watched = watchedResourceUrls.includes(resource.url);

                  return (
                    <button
                      key={resource.url}
                      type="button"
                      onClick={() => setActiveResource(resource)}
                      className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3 text-left transition-colors hover:border-[#C6EA5D] hover:bg-[#FAFBF6]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2F3EE] text-neutral-500">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold tracking-wide text-neutral-400">
                          {resource.type.toUpperCase()}
                        </p>
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {resource.title}
                        </p>
                      </div>
                      {watched ? (
                        <Check className="h-4 w-4 shrink-0 text-[#5C8A1C]" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-neutral-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {skillsWithoutResources.length > 0 && (
              <div className={`flex flex-col gap-2 ${resources.length > 0 ? "mt-2" : ""}`}>
                {skillsWithoutResources.map(({ skill: lower, displayName }) => (
                  <div
                    key={lower}
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-neutral-200 p-3"
                  >
                    <span className="text-xs text-neutral-500">
                      No resources yet for <span className="font-semibold">{displayName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGenerate(lower)}
                      disabled={generatingSkill === lower}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {generatingSkill === lower ? "Generating…" : "Generate with AI"}
                    </button>
                  </div>
                ))}
                {generateError && <p className="text-xs text-red-500">{generateError}</p>}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-neutral-400">
                PRACTICE &amp; PROJECTS
              </p>
              <span className="text-xs text-neutral-400">
                {Math.min(qualifyingSessions, MIN_QUALIFYING_SESSIONS)}/{MIN_QUALIFYING_SESSIONS} sessions
              </span>
            </div>
            <p className="mb-2 text-xs text-neutral-400">
              Complete {MIN_QUALIFYING_SESSIONS} practice sessions of at least{" "}
              {MIN_QUALIFYING_QUESTIONS} questions each on this step&apos;s skills.
            </p>
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[#7FB519]"
                style={{
                  width: `${Math.min((qualifyingSessions / MIN_QUALIFYING_SESSIONS) * 100, 100)}%`,
                }}
              />
            </div>
            <a
              href={buildInterviewHref(jobRoleId, topGapSkill)}
              className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              <MessageSquare className="h-4 w-4" />
              Practice
            </a>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {!isDone && (
            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-5">
              {!canComplete && (
                <div className="flex flex-col gap-1 text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    {allResourcesWatched ? (
                      <Check className="h-3.5 w-3.5 text-[#5C8A1C]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-neutral-300" />
                    )}
                    Watch all resources ({resourcesWatched}/{resources.length})
                  </span>
                  <span className="flex items-center gap-1.5">
                    {practiceMet ? (
                      <Check className="h-3.5 w-3.5 text-[#5C8A1C]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-neutral-300" />
                    )}
                    Complete {MIN_QUALIFYING_SESSIONS} practice sessions (
                    {Math.min(qualifyingSessions, MIN_QUALIFYING_SESSIONS)}/{MIN_QUALIFYING_SESSIONS})
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleComplete}
                disabled={!canComplete || isCompleting}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#7FB519] py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#6FA00F] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                <Check className="h-4 w-4" />
                {isCompleting ? "Saving…" : "Mark Complete"}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <ResourceVideoModal
        resource={activeResource}
        jobRoleId={jobRoleId}
        stepOrder={step.order}
        onClose={() => setActiveResource(null)}
        onWatched={(url) => setWatchedResourceUrls((prev) => [...prev, url])}
      />
    </AnimatePresence>
  );
}
