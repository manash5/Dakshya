import { ChartNoAxesColumn, Cpu, Newspaper, Sparkles } from "lucide-react";

const newsItems = [
  {
    title: "Nepal's Tech Hub: New Opportunities in 2024",
    meta: "5 MIN READ • JUST NOW",
    icon: Newspaper,
    iconClassName: "bg-zinc-700 text-white",
  },
  {
    title: "How AI Reshapes Junior Engineering Roles",
    meta: "8 MIN READ • 4H AGO",
    icon: Cpu,
    iconClassName: "bg-zinc-950 text-white",
  },
];

export function SalaryRangeCard() {
  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-500">
        EXPECTED SALARY RANGE
      </p>
      <div className="mt-2 flex items-end gap-2">
        <h3 className="text-[24px] font-semibold tracking-tight text-zinc-900">
          NPR 60k - 95k
        </h3>
        <span className="pb-1 text-[11px] text-zinc-500">/ MONTH</span>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F6FAE8] px-4 py-3 text-sm font-semibold text-zinc-900">
        <ChartNoAxesColumn size={14} />
        ENTRY LEVEL FRONTEND
      </div>
    </article>
  );
}

export function IndustryNewsCard() {
  return (
    <article className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold tracking-[0.14em] text-zinc-900">
          INDUSTRY NEWS
        </h3>
        <Sparkles size={16} className="text-zinc-500" />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {newsItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-5 text-zinc-900">
                  {item.title}
                </p>
                <p className="mt-1 text-[11px] font-medium tracking-wide text-zinc-500">
                  {item.meta}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
