"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
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

// Counts smoothly from the previous score to the next instead of snapping,
// matching the ring's own stroke-dashoffset transition (see RingGauge.tsx).
function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const controls = animate(previous.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value]);

  return <>{display}</>;
}

const RADIUS = 42;
const ROTATE_INTERVAL_MS = 3000;

interface DashboardHeroCardProps {
  hero: CareerHero[];
}

// Carousel across every target role the user picked, auto-advancing every
// few seconds with dot navigation to jump directly to one. Pauses on hover.
export default function DashboardHeroCard({ hero }: DashboardHeroCardProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (hero.length <= 1 || paused) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % hero.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [hero.length, paused]);

  const current = hero[index] ?? hero[0];

  if (!current) {
    return (
      <article className="flex flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-zinc-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h2 className="text-[18px] font-semibold text-zinc-900">Pick a target career</h2>
        <p className="max-w-[420px] text-[13px] text-zinc-500">
          Choose a career goal to see your readiness score, skill gaps and job market data here.
        </p>
      </article>
    );
  }

  return (
    <article
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
    >
      <div className="grid gap-10 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
        {/* Not remounted on role change (no key) — RingGauge animates its
            own progress prop via framer-motion, so it transitions smoothly
            between roles instead of snapping. */}
        <RingGauge
          value={<AnimatedScore value={current.readinessScore} />}
          label="READY"
          diameter={150}
          viewBoxSize={120}
          radius={RADIUS}
          strokeWidth={8}
          trackStroke="#D7D9D1"
          progressStroke="#C6EF54"
          progress={current.readinessScore}
        />

        <div className="min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.jobRoleId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span className="inline-flex rounded-full bg-[#EEF7CC] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-zinc-700">
                CAREER TARGET
              </span>
              <h2 className="mt-4 text-[22px] font-semibold leading-tight text-zinc-900">
                {current.jobRole}
              </h2>
              <p className="mt-2 max-w-[480px] text-[13px] leading-6 text-zinc-500">
                Based on your current skill set, we think your readiness status is
                <span className="font-semibold text-zinc-900"> {current.readinessLabel}</span>. To reach top tech firms, prioritize these gaps:
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {current.missingSkills.length > 0 ? (
                  current.missingSkills.map((skill) => <Tag key={skill}>{skill}</Tag>)
                ) : (
                  <Tag>No tracked skill gaps</Tag>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {hero.length > 1 ? (
        <div className="mt-7 flex items-center justify-center gap-2 border-t border-zinc-100 pt-5">
          {hero.map((role, i) => (
            <button
              key={role.jobRoleId}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${role.jobRole}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-zinc-900" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      ) : (
        // Purely decorative — only shown when there's no dot-nav row, since
        // both sit in the same bottom-right corner and would otherwise
        // visually collide.
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
      )}
    </article>
  );
}
