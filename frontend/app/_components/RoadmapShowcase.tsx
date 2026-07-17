import { Check, Lock, PlayCircle } from "lucide-react";
import BrowserWindowFrame from "./BrowserWindowFrame";

const STEPS = [
  { title: "Programming Fundamentals", state: "done" as const },
  { title: "Data Structures", state: "done" as const },
  { title: "REST APIs", state: "current" as const },
  { title: "System Design", state: "locked" as const },
];

// Illustrative mockup of the real Roadmap UI -- no product screenshot exists
// yet. Swap for next/image if/when one does.
export default function RoadmapShowcase() {
  return (
    <div className="mx-auto w-80" aria-hidden="true">
      <BrowserWindowFrame title="dakshya.app/progress">
        <div
          className="p-4"
          style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="flex items-start gap-1.5">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-1 items-center">
                <div className="flex min-w-[68px] flex-col items-center gap-1.5 text-center">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      step.state === "done"
                        ? "bg-primary text-white"
                        : step.state === "current"
                          ? "border-2 border-[#C6EA5D] bg-white text-primary-light"
                          : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {step.state === "done" ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : step.state === "current" ? (
                      <PlayCircle className="h-3 w-3" />
                    ) : (
                      <Lock className="h-2.5 w-2.5" />
                    )}
                  </span>
                  <p
                    className={`text-[9px] font-semibold leading-tight ${
                      step.state === "locked" ? "text-neutral-400" : "text-neutral-900"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {i !== STEPS.length - 1 && (
                  <span className="mx-0.5 mt-[-18px] h-px flex-1 bg-neutral-200" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </BrowserWindowFrame>
    </div>
  );
}
