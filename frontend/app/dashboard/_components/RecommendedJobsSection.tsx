import JobCard, { type JobCardProps } from "./JobCard";

const jobCards: JobCardProps[] = [
  {
    match: "78% MATCH",
    title: "Junior Frontend Developer",
    company: "Cloud Tech Nepal",
    location: "KATHMANDU",
  },
  {
    match: "84% MATCH",
    title: "React Engineer (Intern)",
    company: "Swift Innovations",
    location: "LALITPUR",
  },
  {
    match: "72% MATCH",
    title: "UI/UX Developer",
    company: "DataMind Solutions",
    location: "KATHMANDU",
  },
];

export default function RecommendedJobsSection() {
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

      <div className="grid gap-5 lg:grid-cols-3">
        {jobCards.map((job) => (
          <JobCard key={job.title} {...job} />
        ))}
      </div>
    </section>
  );
}
