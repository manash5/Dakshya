"use client";

import { useState } from "react";
import JobCard from "../../_components/JobCard";
import { handleSaveJob, handleUnsaveJob } from "@/lib/actions/savedJob-action";

export type RecommendedJob = {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  experience?: string | null;
  employmentType?: string | null;
  requiredSkills?: string[];
  description?: string;
  applyLink?: string;
  matchedRoleId: string;
};

interface RecommendedJobsGridProps {
  jobs: RecommendedJob[];
  readinessByRole: Record<string, number>;
  savedJobIds: string[];
}

export default function RecommendedJobsGrid({
  jobs,
  readinessByRole,
  savedJobIds,
}: RecommendedJobsGridProps) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(savedJobIds));

  const toggleSave = async (jobId: string) => {
    const wasSaved = savedIds.has(jobId);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });

    const result = wasSaved ? await handleUnsaveJob(jobId) : await handleSaveJob(jobId);

    if (!result.success) {
      // Revert the optimistic update on failure.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.add(jobId);
        } else {
          next.delete(jobId);
        }
        return next;
      });
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Recommended Jobs</h2>
      </div>

      {jobs.length === 0 ? (
        <p className="rounded-[24px] border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No open roles matching your search right now. Check back soon.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {jobs.map((job) => {
            const score = readinessByRole[job.matchedRoleId];

            return (
              <JobCard
                key={job._id}
                match={score !== undefined ? `${score}% MATCH` : "NEW"}
                title={job.title}
                company={job.company}
                location={job.location}
                salary={job.salary}
                experience={job.experience}
                employmentType={job.employmentType}
                requiredSkills={job.requiredSkills}
                description={job.description}
                applyLink={job.applyLink}
                saved={savedIds.has(job._id)}
                onToggleSave={() => toggleSave(job._id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
