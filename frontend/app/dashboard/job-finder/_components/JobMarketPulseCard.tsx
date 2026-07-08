import { ArrowRight, BarChart3 } from "lucide-react";

type SkillDemand = {
  skill: string;
  jobs: number;
  percentage: number;
};

const SKILL_DEMAND: SkillDemand[] = [
  { skill: "React", jobs: 45, percentage: 100 },
  { skill: "Node.js", jobs: 32, percentage: 70 },
  { skill: "Next.js", jobs: 28, percentage: 60 },
];

export default function JobMarketPulseCard() {
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500">
          MARKET PULSE
        </h3>
        <BarChart3 size={16} className="text-zinc-400" />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {SKILL_DEMAND.map((item) => (
          <div key={item.skill}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-zinc-900">
                {item.skill}
              </span>
              <span className="text-xs text-zinc-500">{item.jobs} Jobs</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-between text-xs font-semibold tracking-wide text-zinc-900"
      >
        VIEW FULL MARKET REPORT
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
