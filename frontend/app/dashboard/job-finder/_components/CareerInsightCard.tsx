import { Lightbulb } from "lucide-react";
import type { CareerHero } from "@/lib/api/dashboard";

interface CareerInsightCardProps {
  hero: CareerHero | null;
}

export default function CareerInsightCard({ hero }: CareerInsightCardProps) {
  const message = !hero
    ? "Set a target role on your profile to get personalized career insights."
    : hero.missingSkills.length > 0
      ? `You're ${hero.readinessLabel.toLowerCase()} for ${hero.jobRole} — focus on ${hero.missingSkills[0]} next to close your biggest gap.`
      : `You're ${hero.readinessLabel.toLowerCase()} for ${hero.jobRole} with a ${hero.readinessScore}% readiness score. Keep it up!`;

  return (
    <div className="flex gap-3 rounded-[20px] border-l-4 border-[#6C63FF] bg-[#EEF0FC] p-5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-white">
        <Lightbulb size={13} />
      </span>

      <div>
        <p className="text-sm font-semibold text-zinc-900">Career Insight</p>
        <p className="mt-1 text-sm leading-relaxed text-[#5750C7]">{message}</p>
      </div>
    </div>
  );
}
