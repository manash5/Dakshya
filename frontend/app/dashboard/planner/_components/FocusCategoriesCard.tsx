import Link from "next/link";
import { Target } from "lucide-react";
import type { CareerHero } from "@/lib/api/dashboard";

interface FocusCategoriesCardProps {
  roles: CareerHero[];
  selectedRoleId: string;
}

export default function FocusCategoriesCard({ roles, selectedRoleId }: FocusCategoriesCardProps) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2F3EE] text-neutral-500">
          <Target className="h-3.5 w-3.5" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-neutral-400">
          TARGET ROLES
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {roles.map((role) => {
          const isActive = role.jobRoleId === selectedRoleId;

          return (
            <Link
              key={role.jobRoleId}
              href={`/dashboard/planner?role=${role.jobRoleId}`}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                isActive
                  ? "bg-[#F2F9E4] ring-1 ring-inset ring-[#C6EA5D]"
                  : "hover:bg-[#F7F8F5]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isActive ? "bg-[#7FB519]" : "bg-neutral-300"
                  }`}
                />
                <span className="text-[15px] font-semibold text-neutral-900">
                  {role.jobRole}
                </span>
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-[#7FB519] text-white"
                    : "bg-[#F2F3EE] text-neutral-400"
                }`}
              >
                {role.readinessScore}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
