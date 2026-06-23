function RingGauge() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-[150px] w-[150px]">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="#D7D9D1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="156 42"
            strokeDashoffset="-28"
          />
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="#C6EF54"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="180 18"
            strokeDashoffset="28"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[40px] font-semibold leading-none text-zinc-900">85</div>
          </div>
        </div>
      </div>
      <span className="mt-2 text-[11px] font-medium tracking-[0.24em] text-zinc-500">
        READY
      </span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-rose-400" />
      {children}
    </span>
  );
}

export default function DashboardHeroCard() {
  return (
    <article className="relative overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
        <RingGauge />

        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#EEF7CC] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-zinc-700">
            CAREER TARGET
          </span>
          <h2 className="mt-3 text-[22px] font-semibold leading-tight text-zinc-900">
            Frontend Developer
          </h2>
          <p className="mt-3 max-w-[520px] text-[13px] leading-6 text-zinc-500">
            Based on your current skill set, we think your readiness status is
            <span className="font-semibold text-zinc-900"> Above Normal</span>. To reach top tech firms, prioritize these gaps:
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Tag>TypeScript</Tag>
            <Tag>Tailwind CSS</Tag>
            <Tag>Redux</Tag>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-6 hidden h-20 w-40 lg:block">
        <svg viewBox="0 0 180 70" className="h-full w-full">
          <path
            d="M0 45 C 24 14, 62 14, 90 45 S 156 76, 180 45"
            fill="none"
            stroke="#1D7F4F"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </article>
  );
}
