import FocusCategoriesCard from "./_components/FocusCategoriesCard";
import MarketAlignmentCard from "./_components/MarketAlignmentCard";
import SkillsCoreCard from "./_components/SkillsScoreCard";
import DegreeVsMarketCard from "./_components/DegreeVsMarketCard";
import GrowthRoadmapCard from "./_components/GrowthRoadmapCard";
import ResourceLibraryCard from "./_components/ResourceLibraryCard";

export default function Page() {
  return (
    <div className="bg-[#F7F8F5] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold text-neutral-900">
            Skill Planner
          </h1>
          <p className="mt-1 text-neutral-500">
            Curating your path to{" "}
            <span className="font-semibold text-neutral-900">
              Senior Product Designer
            </span>{" "}
            at Top-tier Tech.
          </p>
        </header>

        <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-5">
            <FocusCategoriesCard />
            <MarketAlignmentCard />
          </div>

          <div className="flex flex-col gap-5">
            <SkillsCoreCard />
            <DegreeVsMarketCard />
          </div>

          <div className="flex flex-col gap-5">
            <GrowthRoadmapCard />
            <ResourceLibraryCard />
          </div>
        </section>
      </div>
    </div>
  );
}