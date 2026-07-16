import type { PracticeAttempt } from "@/lib/api/practiceAttempt";

export interface PracticeStats {
  currentStreakDays: number;
  attemptsThisWeek: number;
  averageScore: number | null;
  scoreTrend: "up" | "down" | "flat" | null;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

// Pure aggregation over whatever attempt page/window is passed in — no new
// backend endpoint. Streak/trend are only as accurate as that window (the
// practice page currently fetches the latest 60 attempts).
export function computePracticeStats(attempts: PracticeAttempt[]): PracticeStats {
  const completed = attempts
    .filter((a) => a.completedAt)
    .sort(
      (a, b) => new Date(b.completedAt as string).getTime() - new Date(a.completedAt as string).getTime(),
    );

  const completedDays = new Set(completed.map((a) => dayKey(new Date(a.completedAt as string))));
  let currentStreakDays = 0;
  const cursor = new Date();
  while (completedDays.has(dayKey(cursor))) {
    currentStreakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const attemptsThisWeek = completed.filter(
    (a) => new Date(a.completedAt as string).getTime() >= weekAgo,
  ).length;

  const scores = completed.map((a) => a.overallScore ?? 0);
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, v) => sum + v, 0) / scores.length)
    : null;

  let scoreTrend: PracticeStats["scoreTrend"] = null;
  if (scores.length >= 2) {
    const recent = scores.slice(0, 5);
    const prior = scores.slice(5, 10);
    if (prior.length > 0) {
      const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
      const priorAvg = prior.reduce((sum, v) => sum + v, 0) / prior.length;
      scoreTrend = recentAvg > priorAvg + 2 ? "up" : recentAvg < priorAvg - 2 ? "down" : "flat";
    }
  }

  return { currentStreakDays, attemptsThisWeek, averageScore, scoreTrend };
}
