import type { ReactNode } from "react";

interface RingGaugeProps {
  value: ReactNode;
  label: ReactNode;
  diameter: number;
  viewBoxSize: number;
  radius: number;
  strokeWidth: number;
  trackStroke: string;
  progressStroke: string;
  // 0-100.
  progress: number;
  valueClassName?: string;
  labelClassName?: string;
  className?: string;
}

export default function RingGauge({
  value,
  label,
  diameter,
  viewBoxSize,
  radius,
  strokeWidth,
  trackStroke,
  progressStroke,
  progress,
  valueClassName = "text-[40px] font-semibold leading-none text-zinc-900",
  labelClassName = "mt-2 text-[11px] font-medium tracking-[0.24em] text-zinc-500",
  className,
}: RingGaugeProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`flex flex-col items-center justify-center ${className ?? ""}`.trim()}>
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="h-full w-full -rotate-90">
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke={trackStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* pathLength=100 is a native SVG2 feature: it makes the browser
              treat this circle's total length as exactly 100 units for
              stroke-dasharray/stroke-dashoffset purposes, regardless of its
              real geometric circumference. So the visible arc is always
              exactly `clamped` percent, computed directly with no
              radius/circumference math involved at all — removes an entire
              class of arithmetic-mismatch bugs the previous two attempts
              (manual circumference math, then framer-motion animating a
              raw strokeDashoffset attribute) were exposed to. Plain CSS
              transition for the animation — no animation library needed
              for something this well-supported natively.
          */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            pathLength={100}
            fill="none"
            stroke={progressStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={100}
            strokeDashoffset={100 - clamped}
            style={{ transition: "stroke-dashoffset 0.7s ease" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={valueClassName}>{value}</div>
          </div>
        </div>
      </div>

      <span className={labelClassName}>{label}</span>
    </div>
  );
}
