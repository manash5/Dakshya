"use client";

import { useState } from "react";

type IntegrationStatus = "in-degree" | "gap-identified";

interface Skill {
  id: string;
  name: string;
  subtitle: string;
  proficiency: number; // 0-100
  status: IntegrationStatus;
  semester?: string;
  gapPercent: number;
  gapSeverity: "low" | "high";
}

const SKILLS: Skill[] = [
  {
    id: "visual-craft",
    name: "Visual Craft",
    subtitle: "Layout, Color, Typo",
    proficiency: 85,
    status: "in-degree",
    semester: "Semester 2",
    gapPercent: 5,
    gapSeverity: "low",
  },
  {
    id: "interaction-design",
    name: "Interaction Design",
    subtitle: "Prototyping, Motion",
    proficiency: 20,
    status: "in-degree",
    semester: "Semester 4",
    gapPercent: 35,
    gapSeverity: "high",
  },
  {
    id: "product-strategy",
    name: "Product Strategy",
    subtitle: "Metrics, Business ROI",
    proficiency: 8,
    status: "gap-identified",
    gapPercent: 50,
    gapSeverity: "high",
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    subtitle: "Amplitude, SQL",
    proficiency: 65,
    status: "in-degree",
    semester: "Semester 3",
    gapPercent: 10,
    gapSeverity: "low",
  },
];

const TABS = [
  { id: "all", label: "All Skills" },
  { id: "critical", label: "Critical Gaps" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SkillsCoreCard() {
  const [activeTab, setActiveTab] = useState<TabId>("critical");

  const visibleSkills =
    activeTab === "critical"
      ? SKILLS.filter((s) => s.gapSeverity === "high")
      : SKILLS;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">My Skills Core</h2>

        <div className="flex items-center gap-2">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      <div className="mb-3 grid grid-cols-[1.3fr_1.6fr_0.7fr] gap-4 px-1">
        <span className="text-xs font-medium tracking-wide text-neutral-400">
          SKILLSET NAME
        </span>
        <span className="text-xs font-medium tracking-wide text-neutral-400">
          PROFICIENCY &amp; DEGREE INTEGRATION
        </span>
        <span className="text-xs font-medium tracking-wide text-neutral-400">
          MARKET GAP
        </span>
      </div>

      <div className="flex flex-col">
        {visibleSkills.map((skill, i) => (
          <div
            key={skill.id}
            className={`grid grid-cols-[1.3fr_1.6fr_0.7fr] items-center gap-4 px-1 py-5 ${
              i !== 0 ? "border-t border-neutral-100" : ""
            }`}
          >
            <div>
              <p className="text-[15px] font-semibold text-neutral-900">
                {skill.name}
              </p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {skill.subtitle}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-[#5C8A1C]"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>

                <button className="shrink-0 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white">
                  PRACTICE
                </button>
              </div>

              <div className="mt-2">
                {skill.status === "in-degree" ? (
                  <span className="inline-flex items-center gap-2 text-xs">
                    <span className="rounded-md bg-[#F2F3EE] px-2 py-1 font-medium text-neutral-500">
                      In Degree
                    </span>
                    <span className="text-neutral-400">{skill.semester}</span>
                  </span>
                ) : (
                  <span className="inline-block rounded-md bg-[#FDF0D5] px-2 py-1 text-xs font-medium text-[#B8860B]">
                    Gap Identified
                  </span>
                )}
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
                -{skill.gapPercent}% Gap
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-xl border border-dashed border-neutral-300 py-4 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-500">
        + Add Benchmark Career Path
      </button>
    </div>
  );
}