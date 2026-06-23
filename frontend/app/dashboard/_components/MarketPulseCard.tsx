import { ArrowRight, MoveUpRight } from "lucide-react";

const marketRows = [
  { label: "React", jobs: 45, width: "84%" },
  { label: "Node.js", jobs: 32, width: "62%" },
  { label: "Next.js", jobs: 28, width: "46%" },
];

export default function MarketPulseCard() {
  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold tracking-[0.16em] text-zinc-900">
          MARKET PULSE
        </h3>
        <MoveUpRight size={16} className="text-zinc-500" />
      </div>

      <div className="mt-5 space-y-5">
        {marketRows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <span className="text-zinc-700">{row.label}</span>
              <span className="font-semibold text-zinc-800">{row.jobs} Jobs</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100">
              <div
                className="h-1.5 rounded-full bg-[#1E7B52]"
                style={{ width: row.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <button className="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-zinc-900">
          VIEW FULL MARKET REPORT
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
