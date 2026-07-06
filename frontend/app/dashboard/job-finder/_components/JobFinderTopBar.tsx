"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

type JobFinderTopBarProps = {
  onSearch?: (query: string) => void;
  onOpenFilters?: () => void;
};

export default function JobFinderTopBar({
  onSearch,
  onOpenFilters,
}: JobFinderTopBarProps) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight text-zinc-900">
          Job Finder
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Explore opportunities tailored to your skills and career path.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-14 flex-1 items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <Search size={18} className="shrink-0 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            type="text"
            placeholder="Search for company, roles or keywords..."
            className="h-full w-full bg-transparent text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-14 shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-zinc-50"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>
    </div>
  );
}
