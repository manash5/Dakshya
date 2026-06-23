import DashboardHeroCard from "./_components/DashboardHeroCard";
import MarketPulseCard from "./_components/MarketPulseCard";
import RecommendedJobsSection from "./_components/RecommendedJobsSection";
import { IndustryNewsCard, SalaryRangeCard } from "./_components/SalaryAndNewsCards";

export default function Page() {
  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <DashboardHeroCard />

          <MarketPulseCard />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.7fr)]">
          <SalaryRangeCard />

          <IndustryNewsCard />
        </section>

        <RecommendedJobsSection />
      </div>
    </div>
  );
}
