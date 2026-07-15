"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ExternalLink, FileText, Newspaper, Play } from "lucide-react";
import type { SkillPlannerResource } from "@/lib/api/skillPlanner";
import { extractYouTubeId } from "@/lib/utils/youtube";

const DEFAULT_VISIBLE_COUNT = 4;

const TYPE_ICON: Record<SkillPlannerResource["type"], typeof BookOpen> = {
  Course: BookOpen,
  Documentation: FileText,
  Video: Play,
  Article: Newspaper,
};

const TYPE_STYLES: Record<SkillPlannerResource["type"], string> = {
  Course: "bg-[#EAF1FB] text-[#2E6BB8]",
  Documentation: "bg-[#F2F3EE] text-neutral-500",
  Video: "bg-[#FDEBEB] text-[#D0362A]",
  Article: "bg-[#F1EAFB] text-[#6B3FA0]",
};

function VideoResource({ resource, youTubeId }: { resource: SkillPlannerResource; youTubeId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-100 transition-shadow hover:shadow-sm">
      <div className="relative aspect-video w-full bg-neutral-900">
        {isPlaying ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1`}
            title={resource.title}
            allow="accelerate; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 block h-full w-full"
            aria-label={`Play ${resource.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail, not an app asset */}
            <img
              src={`https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-0.5 h-5 w-5 fill-neutral-900 text-neutral-900" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${TYPE_STYLES.Video}`}
        >
          VIDEO
        </span>
        <p className="truncate text-sm font-semibold text-neutral-900">{resource.title}</p>
      </div>
    </div>
  );
}

interface ResourceLibraryCardProps {
  resources: SkillPlannerResource[];
}

export default function ResourceLibraryCard({ resources }: ResourceLibraryCardProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedResources = showAll ? resources : resources.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-neutral-400">
          RESOURCE LIBRARY
        </p>
        {resources.length > 0 && (
          <span className="rounded-full bg-[#F2F3EE] px-2.5 py-1 text-xs font-medium text-neutral-500">
            {resources.length}
          </span>
        )}
      </div>

      {resources.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">
          No resources yet for this role.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {displayedResources.map((resource, i) => {
                const youTubeId =
                  resource.type === "Video" ? extractYouTubeId(resource.url) : null;
                const Icon = TYPE_ICON[resource.type];

                return (
                  <motion.div
                    key={`${resource.url}-${i}`}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    {youTubeId ? (
                      <VideoResource resource={resource} youTubeId={youTubeId} />
                    ) : (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-neutral-100 p-3 transition-colors hover:border-[#C6EA5D] hover:bg-[#FAFBF6]"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TYPE_STYLES[resource.type]}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold tracking-wide text-neutral-400">
                            {resource.type.toUpperCase()}
                          </p>
                          <p className="truncate text-sm font-semibold text-neutral-900 group-hover:underline">
                            {resource.title}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-300 group-hover:text-neutral-400" />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {resources.length > DEFAULT_VISIBLE_COUNT && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-4 w-full rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-600"
            >
              {showAll ? "Show Less" : `View All (${resources.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
