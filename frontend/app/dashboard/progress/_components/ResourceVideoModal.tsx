"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { SkillPlannerResource } from "@/lib/api/skillPlanner";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { handleMarkResourceWatched } from "@/lib/actions/userProgress-action";

const COUNTDOWN_SECONDS = 20;

interface ResourceVideoModalProps {
  resource: SkillPlannerResource | null;
  jobRoleId: string;
  stepOrder: number;
  onClose: () => void;
  onWatched: (url: string) => void;
}

export default function ResourceVideoModal({
  resource,
  jobRoleId,
  stepOrder,
  onClose,
  onWatched,
}: ResourceVideoModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!resource) return;
    setSecondsLeft(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resource]);

  useEffect(() => {
    if (!resource) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resource, onClose]);

  if (!resource) return null;

  const youTubeId = resource.type === "Video" ? extractYouTubeId(resource.url) : null;
  const canMarkDone = secondsLeft === 0;

  const handleMarkDone = async () => {
    setIsSaving(true);
    const result = await handleMarkResourceWatched(jobRoleId, stepOrder, resource.url);
    setIsSaving(false);
    if (result.success) {
      onWatched(resource.url);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wide text-neutral-400">
              {resource.type.toUpperCase()}
            </p>
            <p className="truncate text-sm font-semibold text-neutral-900">{resource.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={18} />
          </button>
        </div>

        {youTubeId ? (
          <div className="aspect-video w-full bg-neutral-900">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1`}
              title={resource.title}
              allow="accelerate; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-500">This resource opens on an external site.</p>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Open Resource
            </a>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-xs text-neutral-400">
            {canMarkDone ? "Ready to mark as studied." : `Studying — mark done unlocks in ${secondsLeft}s`}
          </p>
          <button
            type="button"
            onClick={handleMarkDone}
            disabled={!canMarkDone || isSaving}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? "Saving…" : "Mark done"}
          </button>
        </div>
      </div>
    </div>
  );
}
