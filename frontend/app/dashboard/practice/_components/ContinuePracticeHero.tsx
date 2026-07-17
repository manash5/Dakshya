import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { PracticeRecommendation } from "@/lib/utils/practiceRecommendation";
import type { PracticeStats } from "@/lib/utils/practiceStats";

interface ContinuePracticeHeroProps {
  roleTitle: string;
  readinessScore: number;
  readinessLabel: string;
  recommendation: PracticeRecommendation;
  jobRoleId: string;
  stats: PracticeStats;
}

export default function ContinuePracticeHero({
  roleTitle,
  readinessScore,
  readinessLabel,
  recommendation,
  jobRoleId,
  stats,
}: ContinuePracticeHeroProps) {
  const { items, totalQuestions, estimatedMinutes } = recommendation;
  const hasRecommendation = items.length > 0;

  const startHref = hasRecommendation
    ? `/dashboard/practice/interview?jobRoleId=${jobRoleId}&skills=${items
        .map((i) => encodeURIComponent(i.skill.skill))
        .join(",")}&skillLabel=${encodeURIComponent(
        items.map((i) => i.skill.displayName).join(", "),
      )}&questionCount=${totalQuestions}`
    : `/dashboard/practice/interview?jobRoleId=${jobRoleId}`;

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-500">
            Continue improving <span className="font-semibold text-neutral-900">{roleTitle}</span>
          </p>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-[#7FB519]"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-neutral-500">
              {readinessScore}% &middot; {readinessLabel}
            </span>
          </div>

          {stats.currentStreakDays > 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#B8860B]">
              <Flame className="h-3.5 w-3.5" fill="currentColor" />
              {stats.currentStreakDays} day streak
            </p>
          )}
        </div>

        {hasRecommendation && (
          <div className="lg:w-[340px] lg:shrink-0">
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-400">
              TODAY&apos;S RECOMMENDATION
            </p>
            <div className="flex flex-col gap-1.5 rounded-2xl bg-[#F7F8F5] p-3">
              {items.map(({ skill, questionCount }) => (
                <div key={skill.skill} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-800">{skill.displayName}</span>
                  <span className="text-neutral-400">
                    {questionCount} question{questionCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-400">Estimated {estimatedMinutes} min</p>
          </div>
        )}
      </div>

      <Link
        href={startHref}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        {hasRecommendation ? "Start Practice" : "Start Practicing"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
