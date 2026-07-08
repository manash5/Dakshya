import { ChevronRight, SlidersHorizontal } from "lucide-react";

type PracticeStatus = "EXCELLENT" | "PASSED" | "REVIEW REQ";

type PracticeEntry = {
  id: string;
  date: string;
  skillModule: string;
  score: number;
  status: PracticeStatus;
};

const PRACTICE_HISTORY: PracticeEntry[] = [
  { id: "1", date: "Oct 24", skillModule: "Adv React Hooks", score: 92, status: "EXCELLENT" },
  { id: "2", date: "Oct 21", skillModule: "Node Middleware", score: 78, status: "PASSED" },
  { id: "3", date: "Oct 18", skillModule: "SQL Joins", score: 64, status: "REVIEW REQ" },
];

const STATUS_STYLES: Record<PracticeStatus, string> = {
  EXCELLENT: "bg-[#D9F24A] text-zinc-900",
  PASSED: "bg-zinc-100 text-zinc-600",
  "REVIEW REQ": "bg-red-50 text-red-500",
};

export default function PracticeHistoryTable() {
  return (
    <div className="flex flex-col rounded-[24px] border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Practice History
        </h2>
        <button
          type="button"
          aria-label="Filter history"
          className="text-zinc-400 transition hover:text-zinc-700"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_1.6fr_0.8fr_1fr_auto] gap-4 border-y border-zinc-100 bg-zinc-50/60 px-6 py-3 text-[11px] font-semibold tracking-wide text-zinc-400">
        <span>DATE</span>
        <span>SKILL MODULE</span>
        <span>SCORE</span>
        <span>STATUS</span>
        <span />
      </div>

      <div className="flex flex-col">
        {PRACTICE_HISTORY.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="grid grid-cols-[1fr_1.6fr_0.8fr_1fr_auto] items-center gap-4 border-b border-zinc-100 px-6 py-5 text-left transition hover:bg-zinc-50/60 last:border-b-0"
          >
            <span className="text-sm text-zinc-500">{entry.date}</span>
            <span className="text-sm font-semibold text-zinc-900">
              {entry.skillModule}
            </span>
            <span
              className={`text-sm font-semibold ${
                entry.score < 70 ? "text-red-500" : "text-zinc-900"
              }`}
            >
              {entry.score}%
            </span>
            <span
              className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${STATUS_STYLES[entry.status]}`}
            >
              {entry.status}
            </span>
            <ChevronRight size={16} className="text-zinc-300" />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="py-4 text-center text-xs font-semibold tracking-wide text-zinc-500 transition hover:text-zinc-900"
      >
        VIEW ALL HISTORY
      </button>
    </div>
  );
}