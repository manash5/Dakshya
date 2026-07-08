import DailyGoalsCard from "./_components/DailyGoalsCard";
import PracticeHistoryTable from './_components/PracticeHistoryTable'; 
import PracticeTopBar from "./_components/PracticeTopBar";
import ProjectLearningSection from "./_components/ProjectLearningSection";
import QuickDrillCard from "./_components/QuickDrillCard";
import SkillMasterySection from "./_components/SkillMasterySection";

export default function Page() {
  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8">
        <PracticeTopBar />

        <SkillMasterySection />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.9fr)]">
          <PracticeHistoryTable />

          <div className="flex flex-col gap-5">
            <QuickDrillCard />
            <DailyGoalsCard />
          </div>
        </section>

        <ProjectLearningSection />
      </div>
    </div>
  );
}