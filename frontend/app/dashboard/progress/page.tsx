import ReadinessCard from "./_components/ReadinessCard";
import MarketPulseCard from "./_components/MarketPulseCard";
import PageHeader from "./_components/PageHeader";
import RoadmapTimeline from "./_components/RoadmapTimeline";
import SalaryRangeCard from "./_components/SalaryRangeCard";

export default function Page() {
  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <PageHeader userName="Manash" />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <RoadmapTimeline />

          <div className="flex flex-col gap-5">
            <ReadinessCard />
            <SalaryRangeCard />
            <MarketPulseCard />
          </div>
        </section>
      </div>
    </div>
  );
}