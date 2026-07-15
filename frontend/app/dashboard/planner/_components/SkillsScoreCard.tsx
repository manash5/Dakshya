"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, FolderGit2, MessageSquare } from "lucide-react";
import type { SkillPlannerSkill, SkillSourceTag } from "@/lib/api/skillPlanner";

const TABS = [
  { id: "all", label: "All Skills" },
  { id: "priority", label: "High Priority" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DEFAULT_VISIBLE_COUNT = 3;

// Plain-English label + a short one-line explanation of what the status
// means and what to do next, so the badge alone never has to be decoded by
// the user. Kept short (line-clamp-1'd in the row) so the card stays compact.
const STATUS_INFO: Record<SkillPlannerSkill["status"], { label: string; badge: string; description: string }> = {
  Locked: {
    label: "Not Started",
    badge: "bg-neutral-100 text-neutral-500",
    description: "No evidence yet — check the Resources tab.",
  },
  Upcoming: {
    label: "Upcoming",
    badge: "bg-[#EAF1FB] text-[#2E6BB8]",
    description: "Comes later in your degree program.",
  },
  Learning: {
    label: "Learning",
    badge: "bg-[#F2F3EE] text-neutral-600",
    description: "Part of your coursework right now.",
  },
  Practiced: {
    label: "Practiced",
    badge: "bg-[#FDF0D5] text-[#B8860B]",
    description: "Tackled in interviews — try a project next.",
  },
  ProjectApplied: {
    label: "Project Applied",
    badge: "bg-[#E4F3E1] text-[#2F5D2A]",
    description: "Applied in a project — test it in an interview.",
  },
  InterviewReady: {
    label: "Interview Ready",
    badge: "bg-[#E9F7CC] text-[#5C8A1C]",
    description: "Scoring well in mock interviews.",
  },
  Mastered: {
    label: "Mastered",
    badge: "bg-[#2F5D2A] text-white",
    description: "Backed by coursework, project, and interviews.",
  },
};

const SOURCE_LABELS: Record<SkillSourceTag, string> = {
  curriculum: "Degree",
  resume: "Resume",
  project: "Project",
  practice: "Interview",
};

const SOURCE_ICONS: Partial<Record<SkillSourceTag, typeof FileText>> = {
  resume: FileText,
  project: FolderGit2,
  practice: MessageSquare,
};

interface SkillsScoreCardProps {
  skills: SkillPlannerSkill[];
}

export default function SkillsScoreCard({ skills }: SkillsScoreCardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("priority");
  const [showAll, setShowAll] = useState(false);

  const visibleSkills =
    activeTab === "priority" ? skills.filter((s) => s.gapSeverity === "high") : skills;
  const displayedSkills = showAll ? visibleSkills : visibleSkills.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Skill Graph</h2>

        <div className="flex items-center gap-2">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAll(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#C6EA5D] text-neutral-900"
                    : "bg-[#F2F3EE] text-neutral-500 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-4 text-sm text-neutral-400">
        What you have, and what to do next.
      </p>

      {skills.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No required skills found for this role yet.
        </p>
      ) : visibleSkills.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          Nothing high priority right now — nice work.
        </p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-[1.5fr_1.6fr_0.6fr] gap-4 px-1">
            <span className="text-xs font-medium tracking-wide text-neutral-400">
              SKILL &amp; NEXT STEP
            </span>
            <span className="text-xs font-medium tracking-wide text-neutral-400">
              YOUR LEVEL &amp; EVIDENCE
            </span>
            <span className="text-xs font-medium tracking-wide text-neutral-400">
              PRIORITY
            </span>
          </div>

          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {displayedSkills.map((skill, i) => {
                const status = STATUS_INFO[skill.status];

                return (
                  <motion.div
                    key={skill.skill}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`grid grid-cols-[1.5fr_1.6fr_0.6fr] items-center gap-4 px-1 py-3 ${
                        i !== 0 ? "border-t border-neutral-100" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[15px] font-semibold text-neutral-900">
                            {skill.displayName}
                          </p>
                          <span
                            className={`inline-block shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${status.badge}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs leading-snug text-neutral-400">
                          {status.description}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span>Your level</span>
                          <span className="font-semibold text-neutral-600">
                            {skill.proficiency}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                          <motion.div
                            className="h-full rounded-full bg-[#5C8A1C]"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                          />
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {skill.curriculum.taught ? (
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span className="rounded-md bg-[#F2F3EE] px-2 py-1 font-medium text-neutral-500">
                                {skill.curriculum.isPast ? "In Degree" : "Upcoming"}
                              </span>
                              <span className="text-neutral-400">
                                Semester {skill.curriculum.semester}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-[#F2F3EE] px-2 py-1 text-xs font-medium text-neutral-500">
                              Not in your degree
                            </span>
                          )}
                          {skill.sources
                            .filter((s) => s !== "curriculum")
                            .map((source) => {
                              const Icon = SOURCE_ICONS[source];

                              return (
                                <span
                                  key={source}
                                  className="inline-flex items-center gap-1 rounded-md bg-[#F2F3EE] px-2 py-1 text-xs font-medium text-neutral-500"
                                >
                                  {Icon && <Icon className="h-3 w-3" />}
                                  {SOURCE_LABELS[source]}
                                </span>
                              );
                            })}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-block rounded-lg px-3 py-1.5 text-sm font-semibold ${
                            skill.gapSeverity === "high"
                              ? "bg-[#FCE8E6] text-[#D0362A]"
                              : "bg-[#F2F3EE] text-neutral-500"
                          }`}
                        >
                          {skill.gapSeverity === "high" ? "High Priority" : "Low Priority"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {visibleSkills.length > DEFAULT_VISIBLE_COUNT && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-4 w-full rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-600"
            >
              {showAll ? "Show Less" : `View All (${visibleSkills.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
