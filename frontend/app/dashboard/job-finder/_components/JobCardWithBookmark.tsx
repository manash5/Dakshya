import { Bookmark } from "lucide-react";
import JobCard, { type JobCardProps } from "@/components/JobCard";
// ^ Adjust this import path to wherever your existing JobCard component lives.

export type JobCardWithBookmarkProps = JobCardProps & {
  saved?: boolean;
  onToggleSave?: () => void;
};

/**
 * NOTE ON REUSE:
 * The existing JobCard renders its "VIEW DETAILS" button at w-full, so a
 * bookmark pill can't sit flush beside it without editing that component.
 * Per your instruction to reuse JobCard as-is, this wrapper overlays a
 * circular bookmark button on the bottom-right corner of the card so the
 * button row visually matches the design (button + bookmark side by side)
 * without touching JobCard's source. If you'd rather have the bookmark
 * truly inline, JobCard's button needs to drop `w-full` for a flex layout
 * instead — happy to do that if you give the go-ahead.
 */
export default function JobCardWithBookmark({
  saved = false,
  onToggleSave,
  ...jobCardProps
}: JobCardWithBookmarkProps) {
  return (
    <div className="relative">
      <JobCard {...jobCardProps} />

      <button
        type="button"
        onClick={onToggleSave}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved jobs" : "Save job"}
        className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#D9F24A] text-zinc-900 shadow-sm transition hover:brightness-95"
      >
        <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
