"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import DashboardShowcase from "./DashboardShowcase";
import RoadmapShowcase from "./RoadmapShowcase";

function detectReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Plain CSS-transform parallax (perspective + mouse-tilt + a gentle float),
// no WebGL. Ordinary CSS sizing throughout -- no distance/scale formula to
// get wrong, unlike a 3D-canvas approach.
export default function HeroShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(detectReducedMotion);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-90 w-full sm:h-105 lg:h-115"
      style={{ perspective: 1400 }}
    >
      {/* Base card: Dashboard (larger, anchored near the top) */}
      <motion.div
        className="absolute left-1/2 top-4 z-10 -translate-x-1/2 sm:left-[50%]"
        style={{
          rotate: 0,
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
        }}
        animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <DashboardShowcase />
      </motion.div>

      {/* Overlapping card: Roadmap (smaller, overlays top-left corner) */}
      <motion.div
        className="absolute left-[0%] top-[-20] z-20 sm:left-[75%]"
        style={{
          rotate: 3,
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
        }}
        animate={reducedMotion ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <RoadmapShowcase />
      </motion.div>
    </div>
  );
}