import Link from "next/link";
import { getJobRoles } from "@/lib/actions/onboarding-action";
import PracticeInterviewFlow from "./_components/PracticeInterviewFlow";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ jobRoleId?: string; skill?: string; skillLabel?: string }>;
}) {
  const { jobRoleId, skill, skillLabel } = await searchParams;

  if (!jobRoleId) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto flex w-full max-w-[840px] flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white py-20 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Pick a skill first</h1>
          <p className="max-w-md text-neutral-500">
            Start an interview from a skill card on the Practice page so it&apos;s scoped to
            what you actually need to work on.
          </p>
          <Link
            href="/dashboard/practice"
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Go to Practice
          </Link>
        </div>
      </div>
    );
  }

  const jobRoles = await getJobRoles();
  const jobRole = jobRoles.find((r) => r._id === jobRoleId) ?? null;

  return (
    <div className="min-h-screen bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto w-full max-w-[840px]">
        <PracticeInterviewFlow
          jobRoleId={jobRoleId}
          jobRoleTitle={jobRole?.title ?? "this role"}
          skill={skill ?? null}
          skillLabel={skillLabel ?? skill ?? null}
        />
      </div>
    </div>
  );
}
