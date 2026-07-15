import { getJobRoles } from "@/lib/actions/onboarding-action";
import PracticeInterviewFlow from "./_components/PracticeInterviewFlow";

export default async function Page() {
  const jobRoles = await getJobRoles();

  return (
    <div className="min-h-screen bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto w-full max-w-[840px]">
        <PracticeInterviewFlow jobRoles={jobRoles} />
      </div>
    </div>
  );
}
