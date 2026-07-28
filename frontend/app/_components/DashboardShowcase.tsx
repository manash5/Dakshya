import { Briefcase, MapPin, TrendingUp } from "lucide-react";
import RingGauge from "@/app/dashboard/_components/RingGauge";
import BrowserWindowFrame from "./BrowserWindowFrame";

const MARKET_PULSE = [
  { skill: "React", jobs: 45, percent: 82 },
  { skill: "Node.js", jobs: 32, percent: 64 },
  { skill: "SQL", jobs: 28, percent: 58 },
];

const JOBS = [
  { title: "Backend Developer", company: "Cloud Tech Nepal", location: "Kathmandu", match: 84 },
  { title: "React Engineer", company: "Swift Innovations", location: "Lalitpur", match: 78 },
  { title: "Full Stack Developer", company: "Nimbus Labs", location: "Kathmandu", match: 71 },
];

const WEEKLY_ACTIVITY = [40, 65, 50, 80, 45, 90, 60];

// Illustrative mockup of the real Dashboard UI -- no product screenshot
// exists yet. Uses the actual RingGauge component so the readiness ring is
// real UI, not just a lookalike. Swap for next/image if/when one does.
export default function DashboardShowcase() {
  return (
    <div className="w-[460px] sm:w-[620px] lg:w-[800px]" aria-hidden="true">
      <BrowserWindowFrame title="dakshya.app/dashboard">
        <div className="p-5">
          {/* Top row: ring + target on the left, weekly activity on the right */}
          <div className="mb-3.5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-surface p-3.5">
              <RingGauge
                value="85"
                label="READY"
                diameter={60}
                viewBoxSize={200}
                radius={80}
                strokeWidth={20}
                trackStroke="#EBECE6"
                progressStroke="#7FB519"
                progress={85}
                valueClassName="text-sm font-bold text-neutral-900"
                labelClassName="mt-0.5 text-[7px] font-medium tracking-wide text-neutral-400"
              />
              <div>
                <p className="text-[9px] font-semibold tracking-wide text-neutral-400">CAREER TARGET</p>
                <p className="text-xs font-bold text-neutral-900">Backend Developer</p>
                <p className="mt-0.5 text-[10px] text-neutral-500">Above Average readiness</p>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[9px] font-semibold tracking-wide text-neutral-400">WEEKLY ACTIVITY</p>
                <span className="flex items-center gap-1 text-[9px] font-semibold text-primary-dark">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +12%
                </span>
              </div>
              <div className="flex h-10 items-end gap-1">
                {WEEKLY_ACTIVITY.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary-light"
                    style={{ height: `${h}%`, opacity: 0.4 + h / 160 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Market pulse + recommended jobs side by side */}
          <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3.5">
            <div>
              <p className="mb-2 text-[9px] font-semibold tracking-wide text-neutral-400">MARKET PULSE</p>
              <div className="flex flex-col gap-2">
                {MARKET_PULSE.map((row) => (
                  <div key={row.skill} className="flex items-center gap-2">
                    <span className="w-12 shrink-0 text-[10px] font-medium text-neutral-700">
                      {row.skill}
                    </span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-gray-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-[9px] text-neutral-400">
                      {row.jobs} jobs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[9px] font-semibold tracking-wide text-neutral-400">RECOMMENDED JOBS</p>
              <div className="flex flex-col gap-2">
                {JOBS.map((job) => (
                  <div
                    key={job.title}
                    className="flex items-center justify-between rounded-lg bg-surface px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-neutral-400">
                        <Briefcase className="h-3 w-3" />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-900">{job.title}</p>
                        <p className="flex items-center gap-1 text-[9px] text-neutral-400">
                          {job.company}
                          <MapPin className="h-2 w-2" />
                          {job.location}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#E9F7CC] px-1.5 py-0.5 text-[9px] font-semibold text-primary-dark">
                      {job.match}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </BrowserWindowFrame>
    </div>
  );
}