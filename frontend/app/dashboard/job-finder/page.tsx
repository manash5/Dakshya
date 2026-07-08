import CareerInsightCard from "./_components/CareerInsightCard";
import CvAnalyzerCard from "./_components/CvAnalyzerCard";
import JobFinderTopBar from "./_components/JobFinderTopBar";
import JobMarketPulseCard from "./_components/JobMarketPulseCard";
import RecommendedJobsGrid from "./_components/RecommendedJobsGrid";

export default function Page() {
  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <JobFinderTopBar />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <RecommendedJobsGrid />

          <div className="flex flex-col gap-5">
            <CvAnalyzerCard />
            <CareerInsightCard />
            <JobMarketPulseCard />
          </div>
        </section>
      </div>
    </div>
  );
}