import Link from "next/link";
import type { CareerHero } from "@/lib/api/dashboard";

interface RoleTabsProps {
  roles: CareerHero[];
  selectedRoleId: string;
}

export default function RoleTabs({ roles, selectedRoleId }: RoleTabsProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1">
      {roles.map((role) => {
        const isActive = role.jobRoleId === selectedRoleId;

        return (
          <Link
            key={role.jobRoleId}
            href={`/dashboard/progress?role=${role.jobRoleId}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {role.jobRole}
          </Link>
        );
      })}
    </div>
  );
}
