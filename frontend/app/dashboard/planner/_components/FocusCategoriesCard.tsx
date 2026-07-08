"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface FocusCategory {
  id: string;
  label: string;
  active?: boolean;
  hasChevron?: boolean;
}

const CATEGORIES: FocusCategory[] = [
  { id: "product-design", label: "Product Design", active: true },
  { id: "frontend-dev", label: "Frontend Dev", hasChevron: true },
  { id: "ux-research", label: "UX Research", hasChevron: true },
  { id: "design-systems", label: "Design Systems", hasChevron: true },
];

export default function FocusCategoriesCard() {
  const [activeId, setActiveId] = useState("product-design");

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-4 text-xs font-medium tracking-wide text-neutral-400">
        FOCUS CATEGORIES
      </p>

      <div className="flex flex-col gap-1">
        {CATEGORIES.map((category) => {
          const isActive = category.id === activeId;

          return (
            <button
              key={category.id}
              onClick={() => setActiveId(category.id)}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${
                isActive ? "bg-[#F2F3EE]" : "hover:bg-[#F7F8F5]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    isActive ? "bg-[#7FB519]" : "bg-neutral-300"
                  }`}
                />
                <span className="text-[15px] font-semibold text-neutral-900">
                  {category.label}
                </span>
              </span>

              {isActive ? (
                <span className="text-xs font-medium text-[#7FB519]">
                  Active
                </span>
              ) : category.hasChevron ? (
                <ChevronRight className="h-4 w-4 text-neutral-300" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}