import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

interface MockInterviewCardProps {
  jobRoleId: string;
}

// Deliberately separate from Practice: Practice says "let's learn", this
// says "let's evaluate" -- a general, role-scoped (not skill-scoped) session
// that mirrors a real interview instead of drilling one weak skill.
export default function MockInterviewCard({ jobRoleId }: MockInterviewCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ClipboardCheck size={13} />
        </span>
        <span className="text-[11px] font-semibold tracking-wide text-neutral-400">EVALUATION</span>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-neutral-900">Mock Interview</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        A full, role-scoped interview across your required skills — see where you&apos;d stand in
        a real one.
      </p>

      <Link
        href={`/dashboard/practice/interview?jobRoleId=${jobRoleId}`}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Start Mock Interview
      </Link>
    </div>
  );
}
