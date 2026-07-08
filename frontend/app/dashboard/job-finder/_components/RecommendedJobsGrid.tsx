"use client";

import { useState } from "react";
import JobCard from "../../_components/JobCard";

export type RecommendedJob = {
  id: string;
  match: string;
  title: string;
  company: string;
  location: string;
};

const RECOMMENDED_JOBS: RecommendedJob[] = [
  {
    id: "1",
    match: "98% MATCH",
    title: "Junior Frontend Developer",
    company: "Cloud Tech Nepal",
    location: "Kathmandu · $60k - $85k",
  },
  {
    id: "2",
    match: "84% MATCH",
    title: "React Engineer (Intern)",
    company: "Swift Innovations",
    location: "Lalitpur · Full-time",
  },
  {
    id: "3",
    match: "72% MATCH",
    title: "UI/UX Designer",
    company: "DataMind Solutions",
    location: "Kathmandu · Senior Role",
  },
  {
    id: "4",
    match: "72% MATCH",
    title: "UI/UX Designer",
    company: "DataMind Solutions",
    location: "Kathmandu · Senior Role",
  },
  {
    id: "5",
    match: "98% MATCH",
    title: "Junior Frontend Developer",
    company: "Cloud Tech Nepal",
    location: "Kathmandu · $60k - $85k",
  },
  {
    id: "6",
    match: "84% MATCH",
    title: "React Engineer (Intern)",
    company: "Swift Innovations",
    location: "Lalitpur · Full-time",
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
            saved={savedIds.has(job.id)}
            onToggleSave={() => toggleSave(job.id)}
          />
        ))}
      </div>
    </section>
  );
}