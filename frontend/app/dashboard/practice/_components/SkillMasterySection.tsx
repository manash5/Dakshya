"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import type { SkillPlanner } from "@/lib/api/skillPlanner";

interface SkillMasterySectionProps {
  planners: SkillPlanner[];
}

const COLLAPSED_LIMIT = 8;

function proficiencyStyle(proficiency: number) {
  if (proficiency >= 70) return { badge: "bg-emerald-50 text-emerald-700", ring: "border-emerald-200" };
  if (proficiency >= 40) return { badge: "bg-amber-50 text-amber-700", ring: "border-amber-200" };
  return { badge: "bg-rose-50 text-rose-700", ring: "border-rose-200" };
}

function SkillChip({
  jobRoleId,
  skill,
  displayName,
  proficiency,
  roleCount,
}: {
  jobRoleId: string;
  skill: string;
  displayName: string;
  proficiency: number;
  roleCount?: number;
}) {
  const style = proficiencyStyle(proficiency);

  return (
    <Link
      href={`/dashboard/practice/interview?jobRoleId=${jobRoleId}&skill=${encodeURIComponent(skill)}&skillLabel=${encodeURIComponent(displayName)}`}
      className={`group flex items-center gap-3 rounded-2xl border bg-white p-3.5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] ${style.ring}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.badge}`}>
        {displayName.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900">{displayName}</p>
        <p className="text-xs text-zinc-500">
          {proficiency}% mastery
          {roleCount ? ` · in ${roleCount} roles` : ""}
        </p>
      </div>
    </Link>
  );
}

interface SkillGroupChip {
  jobRoleId: string;
  skill: string;
  displayName: string;
  proficiency: number;
  roleCount?: number;
}

interface SkillGroupData {
  key: string;
  icon?: React.ReactNode;
  label: string;
  chips: SkillGroupChip[];
}

function SkillGroupPanel({ icon, label, chips }: Omit<SkillGroupData, "key">) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? chips : chips.slice(0, COLLAPSED_LIMIT);
  const hasMore = chips.length > COLLAPSED_LIMIT;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500">
          {label} ({chips.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((skill) => (
          <SkillChip
            key={skill.skill}
            jobRoleId={skill.jobRoleId}
            skill={skill.skill}
            displayName={skill.displayName}
            proficiency={skill.proficiency}
            roleCount={skill.roleCount}
          />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-zinc-900"
        >
          <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "Show less" : `Show all ${chips.length}`}
        </button>
      )}
    </div>
  );
}

export default function SkillMasterySection({ planners }: SkillMasterySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const entries = planners.flatMap((p) =>
    p.skills.map((s) => ({ ...s, jobRoleId: p.role.jobRoleId, jobRole: p.role.jobRole })),
  );

  if (entries.length === 0) {
    return (
      <section className="rounded-[20px] border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-400">
        No required skills found for your target roles yet.
      </section>
    );
  }

  // Group every skill occurrence (a skill can be required by more than one
  // target role) by its atomic tag, so we can tell shared skills apart from
  // skills that only one role cares about -- makes the high-leverage,
  // multi-role skills visually stand out instead of everything being one
  // flat, undifferentiated list.
  const groups = new Map<string, typeof entries>();
  entries.forEach((e) => {
    const key = e.skill.toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), e]);
  });

  const sharedKeys = new Set(
    [...groups.entries()]
      .filter(([, list]) => new Set(list.map((e) => e.jobRoleId)).size > 1)
      .map(([key]) => key),
  );

  const shared = [...sharedKeys]
    .map((key) => {
      const list = groups.get(key)!;
      const weakest = [...list].sort((a, b) => a.proficiency - b.proficiency)[0];
      const avgProficiency = Math.round(list.reduce((sum, e) => sum + e.proficiency, 0) / list.length);
      return {
        ...weakest,
        proficiency: avgProficiency,
        roleCount: new Set(list.map((e) => e.jobRoleId)).size,
      };
    })
    .sort((a, b) => a.proficiency - b.proficiency);

  const perRole = planners
    .map((p) => ({
      role: p.role,
      skills: p.skills.filter((s) => !sharedKeys.has(s.skill.toLowerCase())),
    }))
    .filter((r) => r.skills.length > 0);

  const isMultiRole = planners.length > 1;

  // The carousel operates over whole GROUPS (Shared, then each role) --
  // one group's full skill list fills the panel at a time, navigated with
  // prev/next or by clicking a group's own tab, rather than scrolling
  // individual skill chips.
  const skillGroups: SkillGroupData[] = [
    ...(shared.length > 0
      ? [
          {
            key: "shared",
            icon: <Layers size={15} className="text-lime-700" />,
            label: "SHARED ACROSS YOUR ROLES",
            chips: shared,
          },
        ]
      : []),
    ...perRole.map(({ role, skills }) => ({
      key: role.jobRoleId,
      label: isMultiRole ? `${role.jobRole.toUpperCase()} ONLY` : "ALL SKILLS",
      chips: skills.map((s) => ({
        jobRoleId: role.jobRoleId,
        skill: s.skill,
        displayName: s.displayName,
        proficiency: s.proficiency,
      })),
    })),
  ];

  const clampedIndex = Math.min(activeIndex, skillGroups.length - 1);
  const activeGroup = skillGroups[clampedIndex];
  const canGoPrev = clampedIndex > 0;
  const canGoNext = clampedIndex < skillGroups.length - 1;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {skillGroups.map((group, i) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                i === clampedIndex
                  ? "bg-neutral-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {group.label.replace(" ONLY", "")}
            </button>
          ))}
        </div>

        {skillGroups.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              aria-label="Previous skill group"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setActiveIndex((i) => Math.min(skillGroups.length - 1, i + 1))}
              aria-label="Next skill group"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup.key}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <SkillGroupPanel icon={activeGroup.icon} label={activeGroup.label} chips={activeGroup.chips} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
