import { Lightbulb } from "lucide-react";

type CareerInsightCardProps = {
  message?: string;
};

export default function CareerInsightCard({
  message = "Roles matching 'Design Systems' have seen a 24% increase in salary offers this month. Consider highlighting this skill!",
}: CareerInsightCardProps) {
  return (
    <div className="flex gap-3 rounded-[20px] border-l-4 border-[#6C63FF] bg-[#EEF0FC] p-5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6C63FF] text-white">
        <Lightbulb size={13} />
      </span>

      <div>
        <p className="text-sm font-semibold text-zinc-900">Career Insight</p>
        <p className="mt-1 text-sm leading-relaxed text-[#5750C7]">
          {message}
        </p>
      </div>
    </div>
  );
}
