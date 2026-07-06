import { Check, Lock } from "lucide-react";

type StepStatus = "done" | "current" | "locked";

interface RoadmapStep {
  id: string;
  week: string;
  title: string;
  description: string;
  status: StepStatus;
}

const STEPS: RoadmapStep[] = [
  {
    id: "audit-core-skills",
    week: "WEEK 01",
    title: "Audit Core Skills",
    description: "Baseline assessment of all core competencies.",
    status: "done",
  },
  {
    id: "mentorship-alignment",
    week: "WEEK 02",
    title: "Mentorship Alignment",
    description: "Matched with 3 senior mentors in fintech.",
    status: "done",
  },
  {
    id: "bridge-strategy-gap",
    week: "WEEK 03 — CURRENT",
    title: "Bridge Strategy Gap",
    description: "Focusing on ROI metrics and business alignment.",
    status: "current",
  },
  {
    id: "portfolio-evolution",
    week: "WEEK 04",
    title: "Portfolio Evolution",
    description: "Updating case studies with strategy insights.",
    status: "locked",
  },
];

export default function GrowthRoadmapCard() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-6 text-xs font-medium tracking-wide text-neutral-400">
        GROWTH ROADMAP
      </p>

      <div className="flex flex-col">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    step.status === "done"
                      ? "bg-[#2F5D2A] text-white"
                      : step.status === "current"
                        ? "bg-[#C6EA5D] text-neutral-900"
                        : "bg-neutral-100 text-neutral-300"
                  }`}
                >
                  {step.status === "done" && (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  )}
                  {step.status === "current" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
                  )}
                  {step.status === "locked" && <Lock className="h-3.5 w-3.5" />}
                </span>

                {!isLast && (
                  <span
                    className={`w-px flex-1 ${
                      step.status === "locked"
                        ? "bg-neutral-100"
                        : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>

              <div className={`pb-7 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`text-xs font-medium tracking-wide ${
                    step.status === "current"
                      ? "text-[#7FB519]"
                      : step.status === "locked"
                        ? "text-neutral-300"
                        : "text-neutral-400"
                  }`}
                >
                  {step.week}
                </p>
                <p
                  className={`mt-1 text-[15px] font-semibold ${
                    step.status === "locked"
                      ? "text-neutral-300"
                      : "text-neutral-900"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`mt-1 text-sm leading-relaxed ${
                    step.status === "locked"
                      ? "text-neutral-300"
                      : "text-neutral-400"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}