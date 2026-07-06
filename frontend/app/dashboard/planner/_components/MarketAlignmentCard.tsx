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
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - matchScore / 100);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-6 text-xs font-medium tracking-wide text-neutral-400">
        MARKET ALIGNMENT
      </p>

      <div className="flex justify-center">
        <div className="relative h-[210px] w-[210px]">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#EBECE6"
              strokeWidth="16"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#C6EA5D"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-neutral-900">
              {matchScore}%
            </span>
            <span className="mt-1 text-xs font-medium tracking-wide text-neutral-400">
              MATCH SCORE
            </span>
          </div>
        </div>
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