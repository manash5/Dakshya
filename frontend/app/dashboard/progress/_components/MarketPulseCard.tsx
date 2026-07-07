import { TrendingUp } from "lucide-react";

interface MarketRow {
  label: string;
  openings: number;
  fillPercent: number;
}

const ROWS: MarketRow[] = [
  { label: "Flutter Jobs", openings: 45, fillPercent: 72 },
  { label: "React Native", openings: 32, fillPercent: 52 },
];

export default function MarketPulseCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold tracking-[0.1em] text-zinc-900">MARKET PULSE</h3>
        <TrendingUp className="h-4 w-4 text-zinc-400" />
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {ROWS.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-zinc-900">{row.label}</span>
              <span className="text-xs text-zinc-400">{row.openings} Openings</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-lime-400" style={{ width: `${row.fillPercent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}