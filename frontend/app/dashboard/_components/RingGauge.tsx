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
  trackDasharray?: string;
  trackDashoffset?: number;
  progressDasharray?: string;
  progressDashoffset?: number;
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
  trackDasharray,
  trackDashoffset,
  progressDasharray,
  progressDashoffset,
  valueClassName = "text-[40px] font-semibold leading-none text-zinc-900",
  labelClassName = "mt-2 text-[11px] font-medium tracking-[0.24em] text-zinc-500",
  className,
}: RingGaugeProps) {
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
            strokeDasharray={trackDasharray}
            strokeDashoffset={trackDashoffset}
          />
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            fill="none"
            stroke={progressStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={progressDasharray}
            strokeDashoffset={progressDashoffset}
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