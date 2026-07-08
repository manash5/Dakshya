import { Settings, Zap } from "lucide-react";

type QuickDrillCardProps = {
  onStartDrill?: () => void;
};

export default function QuickDrillCard({ onStartDrill }: QuickDrillCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-zinc-900 p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.15)]">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D9F24A]/15 text-[#D9F24A]">
          <Zap size={13} fill="currentColor" />
        </span>
        <span className="text-[11px] font-semibold tracking-wide text-zinc-400">
          QUICK-DRILL
        </span>
      </div>

      <h3 className="mt-4 text-xl font-semibold">Knowledge Check</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        10 rapid-fire questions to sharpen your current path focus.
      </p>

      <button
        type="button"
        onClick={onStartDrill}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#D9F24A] text-sm font-semibold text-zinc-900 transition hover:brightness-95"
      >
        Start Drill Now
      </button>

      <Settings
        size={72}
        className="pointer-events-none absolute -bottom-4 -right-4 text-white/5"
      />
    </div>
  );
}