import { TrendingUp } from "lucide-react";
import RingGauge from "../../_components/RingGauge";

interface MarketAlignmentCardProps {
  matchScore: number;
  matchedSkillsCount: number;
  requiredSkillsCount: number;
  roleTitle: string;
}

export default function MarketAlignmentCard({
  matchScore,
  matchedSkillsCount,
  requiredSkillsCount,
  roleTitle,
}: MarketAlignmentCardProps) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F3EE] text-neutral-500">
          <TrendingUp className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-neutral-400">
          MARKET ALIGNMENT
        </p>
      </div>

      <div className="flex justify-center">
        <RingGauge
          value={`${matchScore}%`}
          label="MATCH SCORE"
          diameter={210}
          viewBoxSize={200}
          radius={80}
          strokeWidth={16}
          trackStroke="#EBECE6"
          progressStroke="#C6EA5D"
          progress={matchScore}
          valueClassName="text-4xl font-bold text-neutral-900"
          labelClassName="mt-1 text-xs font-medium tracking-wide text-neutral-400"
        />
      </div>

      <p className="mt-6 text-center text-sm leading-relaxed text-neutral-500">
        Your skills align with{" "}
        <span className="font-semibold text-neutral-900">
          {matchedSkillsCount} of {requiredSkillsCount}
        </span>{" "}
        market-required skills for {roleTitle}.
      </p>
    </div>
  );
}
