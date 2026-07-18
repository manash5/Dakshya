import { Bookmark } from "lucide-react";
import type { SavedJob } from "@/lib/api/savedJob";

interface SavedJobsCardProps {
  savedJobs: SavedJob[];
}

export default function SavedJobsCard({ savedJobs }: SavedJobsCardProps) {
  const items = savedJobs.slice(0, 5);

  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-zinc-500">SAVED JOBS</h3>
        <Bookmark size={16} className="text-zinc-400" />
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
          Bookmark a job to keep track of it here.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {items.map((saved) => (
            <a
              key={saved._id}
              href={saved.jobPostingId.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <p className="text-sm font-semibold text-zinc-900 hover:underline">
                {saved.jobPostingId.title}
              </p>
              <p className="text-xs text-zinc-500">{saved.jobPostingId.company}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
