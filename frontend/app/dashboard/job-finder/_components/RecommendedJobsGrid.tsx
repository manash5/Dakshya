"use client";

import { useState } from "react";
import JobCard from "../../_components/JobCard";

export type RecommendedJob = {
  id: string;
  match: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  experience?: string | null;
  employmentType?: string | null;
  requiredSkills?: string[];
  description?: string;
  applyLink?: string;
};

const RECOMMENDED_JOBS: RecommendedJob[] = [
  {
    id: "1",
    match: "98% MATCH",
    title: "Junior Frontend Developer",
    company: "Cloud Tech Nepal",
    location: "Kathmandu · $60k - $85k",
    salary: "NPR 60k - 85k",
    experience: "0-1 years",
    employmentType: "Full-time",
    requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
    description:
      "Build and maintain customer-facing dashboards used by 50k+ monthly users. You'll pair closely with design and backend to ship new features every sprint.",
    applyLink: "https://example.com/jobs/junior-frontend-developer",
  },
  {
    id: "2",
    match: "84% MATCH",
    title: "React Engineer (Intern)",
    company: "Swift Innovations",
    location: "Lalitpur · Full-time",
    salary: "NPR 35k - 45k",
    experience: "Internship",
    employmentType: "Internship",
    requiredSkills: ["React", "JavaScript", "Git"],
    description:
      "6-month internship building internal tooling in React, with mentorship from senior engineers and a clear path to a full-time offer.",
    applyLink: "https://example.com/jobs/react-engineer-intern",
  },
  {
    id: "3",
    match: "72% MATCH",
    title: "UI/UX Designer",
    company: "DataMind Solutions",
    location: "Kathmandu · Senior Role",
    salary: "NPR 80k - 110k",
    experience: "3+ years",
    employmentType: "Full-time",
    requiredSkills: ["Figma", "Design Systems", "User Research"],
    description:
      "Own the end-to-end design process for our analytics product, from research through high-fidelity prototypes and handoff to engineering.",
    applyLink: "https://example.com/jobs/ui-ux-designer",
  },
  {
    id: "4",
    match: "72% MATCH",
    title: "UI/UX Designer",
    company: "DataMind Solutions",
    location: "Kathmandu · Senior Role",
    salary: "NPR 80k - 110k",
    experience: "3+ years",
    employmentType: "Full-time",
    requiredSkills: ["Figma", "Design Systems", "User Research"],
    description:
      "Own the end-to-end design process for our analytics product, from research through high-fidelity prototypes and handoff to engineering.",
    applyLink: "https://example.com/jobs/ui-ux-designer-2",
  },
  {
    id: "5",
    match: "98% MATCH",
    title: "Junior Frontend Developer",
    company: "Cloud Tech Nepal",
    location: "Kathmandu · $60k - $85k",
    salary: "NPR 60k - 85k",
    experience: "0-1 years",
    employmentType: "Full-time",
    requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
    description:
      "Build and maintain customer-facing dashboards used by 50k+ monthly users. You'll pair closely with design and backend to ship new features every sprint.",
    applyLink: "https://example.com/jobs/junior-frontend-developer-2",
  },
  {
    id: "6",
    match: "84% MATCH",
    title: "React Engineer (Intern)",
    company: "Swift Innovations",
    location: "Lalitpur · Full-time",
    salary: "NPR 35k - 45k",
    experience: "Internship",
    employmentType: "Internship",
    requiredSkills: ["React", "JavaScript", "Git"],
    description:
      "6-month internship building internal tooling in React, with mentorship from senior engineers and a clear path to a full-time offer.",
    applyLink: "https://example.com/jobs/react-engineer-intern-2",
  },
];

export default function RecommendedJobsGrid() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Recommended Jobs
        </h2>
        <button
          type="button"
          className="text-xs font-semibold tracking-wide text-zinc-500 transition hover:text-zinc-900"
        >
          SEE ALL MATCHES
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {RECOMMENDED_JOBS.map((job) => (
          <JobCard
            key={job.id}
            match={job.match}
            title={job.title}
            company={job.company}
            location={job.location}
            salary={job.salary}
            experience={job.experience}
            employmentType={job.employmentType}
            requiredSkills={job.requiredSkills}
            description={job.description}
            applyLink={job.applyLink}
            saved={savedIds.has(job.id)}
            onToggleSave={() => toggleSave(job.id)}
          />
        ))}
      </div>
    </section>
  );
}