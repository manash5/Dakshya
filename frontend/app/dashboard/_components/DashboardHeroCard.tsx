import RingGauge from "./RingGauge";

import type { ReactNode } from "react";
import type { CareerHero } from "@/lib/api/dashboard";

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-rose-400" />
      {children}
    </span>
  );
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DashboardHeroCardProps {
  hero: CareerHero[];
}

// Renders the target role with the highest readiness score. `hero` carries
// every target role the user picked, so a carousel across all of them (as
// designed) is a frontend-only follow-up — no API change needed.
export default function DashboardHeroCard({ hero }: DashboardHeroCardProps) {
  const primary = [...hero].sort((a, b) => b.readinessScore - a.readinessScore)[0];

  if (!primary) {
    return (
      <article className="flex flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-zinc-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h2 className="text-[18px] font-semibold text-zinc-900">Pick a target career</h2>
        <p className="max-w-[420px] text-[13px] text-zinc-500">
          Choose a career goal to see your readiness score, skill gaps and job market data here.
        </p>
      </article>
    );
  }

  const progressOffset = CIRCUMFERENCE * (1 - primary.readinessScore / 100);

  return (
    <article className="relative overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
        <RingGauge
          value={primary.readinessScore}
          label="READY"
          diameter={150}
          viewBoxSize={120}
          radius={RADIUS}
          strokeWidth={8}
          trackStroke="#D7D9D1"
          progressStroke="#C6EF54"
          trackDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          trackDashoffset={0}
          progressDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          progressDashoffset={progressOffset}
        />

        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#EEF7CC] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-zinc-700">
            CAREER TARGET
          </span>
          <h2 className="mt-3 text-[22px] font-semibold leading-tight text-zinc-900">
            {primary.jobRole}
          </h2>
          <p className="mt-3 max-w-[520px] text-[13px] leading-6 text-zinc-500">
            Based on your current skill set, we think your readiness status is
            <span className="font-semibold text-zinc-900"> {primary.readinessLabel}</span>. To reach top tech firms, prioritize these gaps:
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {primary.missingSkills.length > 0 ? (
              primary.missingSkills.map((skill) => <Tag key={skill}>{skill}</Tag>)
            ) : (
              <Tag>No tracked skill gaps</Tag>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-6 hidden h-20 w-40 lg:block">
        <svg viewBox="0 0 180 70" className="h-full w-full">
          <path
            d="M0 45 C 24 14, 62 14, 90 45 S 156 76, 180 45"
            fill="none"
            stroke="#1D7F4F"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </article>
  );
}
