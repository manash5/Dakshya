import { Flame, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { PracticeStats } from "@/lib/utils/practiceStats";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLOR = { up: "text-emerald-500", down: "text-red-500", flat: "text-zinc-400" };

interface PracticeStreakCardProps {
  stats: PracticeStats;
}

export default function PracticeStreakCard({ stats }: PracticeStreakCardProps) {
  const TrendIcon = stats.scoreTrend ? TREND_ICON[stats.scoreTrend] : null;

  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">Practice Streak</h3>
        <span className="flex items-center gap-1 rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
          <Flame size={12} fill="currentColor" />
          {stats.currentStreakDays} DAY{stats.currentStreakDays === 1 ? "" : "S"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-semibold text-zinc-900">{stats.attemptsThisWeek}</p>
          <p className="mt-0.5 text-xs text-zinc-500">This week</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-semibold text-zinc-900">
              {stats.averageScore ?? "—"}
              {stats.averageScore !== null ? "%" : ""}
            </p>
            {TrendIcon && stats.scoreTrend && (
              <TrendIcon size={16} className={TREND_COLOR[stats.scoreTrend]} />
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">Avg score</p>
        </div>
      </div>

      {stats.attemptsThisWeek === 0 && stats.currentStreakDays === 0 && (
        <p className="mt-4 text-sm text-zinc-400">Complete an interview to start your streak.</p>
      )}
    </div>
  );
}
