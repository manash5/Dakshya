"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";
import type { Project } from "@/lib/api/project";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";
import { STATUS_INFO, SOURCE_LABELS, SOURCE_ICONS } from "./skillStatus";
import { buildInterviewHref } from "@/lib/utils/practiceLink";
import SkillDetailDrawer from "./SkillDetailDrawer";
import AddSkillEvidenceModal from "./AddSkillEvidenceModal";

const DEFAULT_VISIBLE_COUNT = 3;

interface SkillsScoreCardProps {
  skills: SkillPlannerSkill[];
  jobRoleId: string;
  projects: Project[];
  attempts: PracticeAttempt[];
}

export default function SkillsScoreCard({
  skills,
  jobRoleId,
  projects,
  attempts,
}: SkillsScoreCardProps) {
  const [showAll, setShowAll] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillPlannerSkill | null>(null);
  const [evidenceSkill, setEvidenceSkill] = useState<SkillPlannerSkill | null>(null);

  const displayedSkills = showAll ? skills : skills.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="mb-1 text-xl font-bold text-neutral-900">Skill Graph</h2>

      <p className="mb-4 text-sm text-neutral-400">
        What you have, and what to do next.
      </p>

      {skills.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No required skills found for this role yet.
        </p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-[1.5fr_1.6fr_0.7fr] gap-4 px-1">
            <span className="text-xs font-medium tracking-wide text-neutral-400">
              SKILL &amp; NEXT STEP
            </span>
            <span className="text-xs font-medium tracking-wide text-neutral-400">
              YOUR LEVEL &amp; EVIDENCE
            </span>
            <span className="text-xs font-medium tracking-wide text-neutral-400">ACTION</span>
          </div>

          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {displayedSkills.map((skill, i) => {
                const status = STATUS_INFO[skill.status];
                const isUnleveled = skill.status === "Locked";

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
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSkill(skill)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedSkill(skill);
                        }
                      }}
                      className={`grid cursor-pointer grid-cols-[1.5fr_1.6fr_0.7fr] items-center gap-4 px-1 py-3 text-left transition-colors hover:bg-[#FAFBF6] ${
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

                      <div className="flex items-start">
                        {isUnleveled ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEvidenceSkill(skill);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                          >
                            <Plus className="h-3 w-3" />
                            Add Skill
                          </button>
                        ) : (
                          <a
                            href={buildInterviewHref(jobRoleId, skill)}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
                          >
                            Practice
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {skills.length > DEFAULT_VISIBLE_COUNT && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-4 w-full rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-600"
            >
              {showAll ? "Show Less" : `View All (${skills.length})`}
            </button>
          )}
        </>
      )}

      <SkillDetailDrawer
        skill={selectedSkill}
        projects={projects}
        attempts={attempts}
        jobRoleId={jobRoleId}
        onClose={() => setSelectedSkill(null)}
      />

      <AddSkillEvidenceModal
        skill={evidenceSkill}
        jobRoleId={jobRoleId}
        onClose={() => setEvidenceSkill(null)}
      />
    </div>
  );
}
