"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";

interface SkillMasterySectionProps {
  jobRoleId: string;
  skills: SkillPlannerSkill[];
}

export default function SkillMasterySection({ jobRoleId, skills }: SkillMasterySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (skills.length === 0) {
    return (
      <section className="rounded-[20px] border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-400">
        No required skills found for this role yet.
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500">
          ALL SKILLS ({skills.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-240)}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(240)}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {skills.map((skill, i) => (
          <Link
            key={skill.skill}
            href={`/dashboard/practice/interview?jobRoleId=${jobRoleId}&skill=${encodeURIComponent(skill.skill)}&skillLabel=${encodeURIComponent(skill.displayName)}`}
            className={`relative w-[180px] shrink-0 snap-start overflow-hidden rounded-[20px] border bg-white p-5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:border-zinc-300 ${
              i === 0 ? "border-zinc-900" : "border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-600">
                {skill.displayName.slice(0, 2).toUpperCase()}
              </span>
              {i === 0 && (
                <span className="rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
                  TOP GAP
                </span>
              )}
            </div>

            <p className="mt-6 truncate text-base font-semibold text-zinc-900">
              {skill.displayName}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">{skill.proficiency}% Mastery</p>

            {i === 0 && <span className="absolute inset-x-0 bottom-0 h-1 bg-[#D9F24A]" />}
          </Link>
        ))}
      </div>
    </section>
  );
}
