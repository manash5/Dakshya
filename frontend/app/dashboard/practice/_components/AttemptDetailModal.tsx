"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";
import AttemptResults from "./AttemptResults";

interface AttemptDetailModalProps {
  attempt: PracticeAttempt | null;
  onClose: () => void;
}

export default function AttemptDetailModal({ attempt, onClose }: AttemptDetailModalProps) {
  useEffect(() => {
    if (!attempt) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attempt, onClose]);

  if (!attempt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-semibold leading-tight text-zinc-900">
            Interview Results
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <AttemptResults attempt={attempt} />
        </div>
      </div>
    </div>
  );
}
