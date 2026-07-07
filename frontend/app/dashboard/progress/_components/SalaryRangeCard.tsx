import { Briefcase } from "lucide-react";

export default function SalaryRangeCard() {
  return (
    <div className="rounded-2xl bg-zinc-900 p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">EXPECTED SALARY RANGE</p>

      <p className="mt-2 text-2xl font-bold text-white">
        NPR 45k &ndash; 75k <span className="text-sm font-medium text-zinc-400">/ MONTH</span>
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-300 px-3.5 py-2">
        <Briefcase className="h-3.5 w-3.5 text-zinc-900" />
        <span className="text-xs font-bold tracking-wide text-zinc-900">JUNIOR FLUTTER DEV</span>
      </div>
    </div>
  );
}