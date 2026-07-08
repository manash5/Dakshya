"use client";

import { useState } from "react";

const ROLES = ["Flutter Developer", "Frontend Developer", "Data Analyst", "Backend Engineer"] as const;

export default function RoleTabs() {
  const [active, setActive] = useState<(typeof ROLES)[number]>("Flutter Developer");

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {ROLES.map((role) => {
        const isActive = role === active;

        return (
          <button
            key={role}
            type="button"
            onClick={() => setActive(role)}
            className={[
              "rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
            ].join(" ")}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}