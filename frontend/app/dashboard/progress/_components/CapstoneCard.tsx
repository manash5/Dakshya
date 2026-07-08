import { Sparkles } from "lucide-react";

export default function CapstoneCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime-200/40 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">CAPSTONE PROJECT</span>
        <Sparkles className="h-5 w-5 text-lime-500" />
      </div>

      <h3 className="relative mt-3 text-2xl font-bold text-zinc-900">E-commerce App v1.0</h3>
      <p className="relative mt-2 max-w-xl text-[15px] text-zinc-500">
        Full clean-architecture implementation with real-time syncing and local payment integration.
      </p>

      <div className="relative mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-5">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">ARCHITECTURE</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">DDD / Clean</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">TECH STACK</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">Riverpod + Firebase</p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-lime-300 transition-colors hover:bg-zinc-800"
        >
          Start Final Project
        </button>
      </div>
    </div>
  );
}