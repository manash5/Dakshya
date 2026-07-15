import { Check, GraduationCap, X } from "lucide-react";
import RingGauge from "../../_components/RingGauge";
import type { SkillPlannerSkill } from "@/lib/api/skillPlanner";

const MAX_VISIBLE_PER_COLUMN = 6;

interface DegreeVsMarketCardProps {
  skills: SkillPlannerSkill[];
  curriculumCoveragePercent: number;
}

export default function DegreeVsMarketCard({
  skills,
  curriculumCoveragePercent,
}: DegreeVsMarketCardProps) {
  const taught = skills.filter((s) => s.curriculum.taught);
  const notTaught = skills.filter((s) => !s.curriculum.taught);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F3EE] text-neutral-500">
          <GraduationCap className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-neutral-400">
          DEGREE VS MARKET
        </p>
      </div>

      {skills.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          No required skills found for this role yet.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-xl bg-[#FAFBF6] p-4">
            <RingGauge
              value={`${curriculumCoveragePercent}%`}
              label="COVERAGE"
              diameter={92}
              viewBoxSize={200}
              radius={80}
              strokeWidth={20}
              trackStroke="#EBECE6"
              progressStroke="#7FB519"
              progress={curriculumCoveragePercent}
              valueClassName="text-base font-bold text-neutral-900"
              labelClassName="text-[8px] font-medium tracking-wide text-neutral-400"
            />
            <p className="text-sm leading-relaxed text-neutral-500">
              Your degree teaches{" "}
              <span className="font-semibold text-neutral-900">
                {taught.length} of {skills.length}
              </span>{" "}
              skills the market requires for this role.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 divide-x divide-neutral-100">
            <div className="pr-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#5C8A1C]" />
                <p className="text-xs font-semibold tracking-wide text-neutral-500">
                  IN DEGREE ({taught.length})
                </p>
              </div>
              {taught.length === 0 ? (
                <p className="text-sm text-neutral-400">None yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {taught.slice(0, MAX_VISIBLE_PER_COLUMN).map((skill) => (
                    <div
                      key={skill.skill}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate font-medium text-neutral-700">
                        {skill.displayName}
                      </span>
                      <span className="shrink-0 text-xs text-neutral-400">
                        Sem {skill.curriculum.semester}
                      </span>
                    </div>
                  ))}
                  {taught.length > MAX_VISIBLE_PER_COLUMN && (
                    <p className="text-xs text-neutral-400">
                      +{taught.length - MAX_VISIBLE_PER_COLUMN} more
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pl-4">
              <div className="mb-3 flex items-center gap-1.5">
                <X className="h-3.5 w-3.5 text-[#D0362A]" />
                <p className="text-xs font-semibold tracking-wide text-neutral-500">
                  GAP ({notTaught.length})
                </p>
              </div>
              {notTaught.length === 0 ? (
                <p className="text-sm text-neutral-400">Fully covered.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {notTaught.slice(0, MAX_VISIBLE_PER_COLUMN).map((skill) => (
                    <div
                      key={skill.skill}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate font-medium text-neutral-700">
                        {skill.displayName}
                      </span>
                      <span
                        className={`shrink-0 text-xs ${
                          skill.sources.length > 0 ? "text-[#5C8A1C]" : "text-[#B8860B]"
                        }`}
                      >
                        {skill.sources.length > 0 ? "Self-taught" : "Gap"}
                      </span>
                    </div>
                  ))}
                  {notTaught.length > MAX_VISIBLE_PER_COLUMN && (
                    <p className="text-xs text-neutral-400">
                      +{notTaught.length - MAX_VISIBLE_PER_COLUMN} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
