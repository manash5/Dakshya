import RingGauge from "../../_components/RingGauge";

interface MarketAlignmentCardProps {
  matchScore?: number;
  vacancies?: number;
  location?: string;
}

export default function MarketAlignmentCard({
  matchScore = 75,
  vacancies = 142,
  location = "Kathmandu valley",
}: MarketAlignmentCardProps) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-6 text-xs font-medium tracking-wide text-neutral-400">
        MARKET ALIGNMENT
      </p>

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
          {vacancies} vacancies
        </span>{" "}
        in {location}.
      </p>
    </div>
  );
}