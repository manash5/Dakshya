import JobCard from "./JobCard";
import type { CareerHero } from "@/lib/api/dashboard";

export interface RecommendedJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobRole: { _id: string; title?: string } | string;
}

interface RecommendedJobsSectionProps {
  jobs: RecommendedJob[];
  hero: CareerHero[];
}

export default function RecommendedJobsSection({ jobs, hero }: RecommendedJobsSectionProps) {
  const readinessByRole = new Map(hero.map((role) => [role.jobRoleId, role.readinessScore]));

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-zinc-900">
          Recommended Jobs
        </h2>
        <button className="text-[12px] font-semibold tracking-wide text-zinc-900 underline decoration-zinc-900/80 underline-offset-4">
          SEE ALL MATCHES
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className="rounded-[24px] border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No open roles for your target careers right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {jobs.map((job) => {
            const jobRoleId = typeof job.jobRole === "string" ? job.jobRole : job.jobRole._id;
            const score = readinessByRole.get(jobRoleId);

            return (
              <JobCard
                key={job._id}
                match={score !== undefined ? `${score}% MATCH` : "NEW"}
                title={job.title}
                company={job.company}
                location={(job.location ?? "").toUpperCase()}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
