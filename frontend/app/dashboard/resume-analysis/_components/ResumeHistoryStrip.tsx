"use client";

import { Plus } from "lucide-react";
import type { ResumeAnalysis } from "@/lib/api/resumeAnalysis";

export default function ResumeHistoryStrip({
    history,
    selectedId,
    onSelect,
    onUploadNew,
}: {
    history: ResumeAnalysis[];
    selectedId: string | null;
    onSelect: (analysis: ResumeAnalysis) => void;
    onUploadNew: () => void;
}) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
                type="button"
                onClick={onUploadNew}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
            >
                <Plus size={13} /> New analysis
            </button>

            {history.map((entry) => {
                const active = entry._id === selectedId;
                return (
                    <button
                        key={entry._id}
                        type="button"
                        onClick={() => onSelect(entry)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                            active
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                        }`}
                    >
                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        <span className={active ? "text-[#D9F24A]" : "text-zinc-400"}>
                            · {Math.round(entry.atsScore)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
