import { handleGetLatestResumeAnalysis, handleGetResumeHistory } from "@/lib/actions/resumeAnalysis-action";
import ResumeAnalyzerFlow from "./_components/ResumeAnalyzerFlow";

export default async function Page() {
  const [latestResult, historyResult] = await Promise.all([
    handleGetLatestResumeAnalysis(),
    handleGetResumeHistory({ limit: 10 }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto w-full max-w-[900px]">
        <ResumeAnalyzerFlow
          initialLatest={latestResult.success ? latestResult.data : null}
          initialHistory={historyResult.success ? historyResult.data : []}
        />
      </div>
    </div>
  );
}
