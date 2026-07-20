"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Modal from "../../_components/Modal";
import {
    handleGenerateCareerKnowledge,
    handleRegenerateCareerKnowledge,
    handleDeleteCareerKnowledge,
} from "@/lib/actions/admin/careerKnowledge-action";

export interface CareerKnowledgeRow {
    jobRoleId: string;
    jobRoleTitle: string;
    category: string;
    hasKnowledge: boolean;
    roadmapSteps: number;
    difficulty: string | null;
    salary: string | null;
    aiGeneratedDate: string | null;
    isUpdating: boolean;
}

function formatDate(value: string | null) {
    if (!value) return "Never";
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function CareerKnowledgeTable({ rows }: { rows: CareerKnowledgeRow[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
    const [target, setTarget] = useState<CareerKnowledgeRow | null>(null);

    const runAction = (roleId: string, action: () => Promise<{ success: boolean; message?: string }>, verb: string) => {
        setPendingRoleId(roleId);
        startTransition(async () => {
            const result = await action();
            setPendingRoleId(null);
            if (result.success) {
                toast.success(`Career knowledge ${verb} successfully`);
                router.refresh();
            } else {
                toast.error(result.message || `Failed to ${verb} career knowledge`);
            }
        });
    };

    const onDelete = () => {
        if (!target) return;
        runAction(target.jobRoleId, () => handleDeleteCareerKnowledge(target.jobRoleId), "deleted");
        setTarget(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Career Knowledge</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        AI-generated career descriptions, roadmaps, and salary data per role. Generating or
                        regenerating calls the AI service and can take up to a minute.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Role</th>
                                <th className="px-5 py-3 font-semibold">Roadmap Steps</th>
                                <th className="px-5 py-3 font-semibold">Difficulty</th>
                                <th className="px-5 py-3 font-semibold">Salary</th>
                                <th className="px-5 py-3 font-semibold">Last Generated</th>
                                <th className="px-5 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const rowPending = isPending && pendingRoleId === row.jobRoleId;

                                return (
                                    <tr key={row.jobRoleId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-gray-900">{row.jobRoleTitle}</p>
                                            <p className="text-xs text-gray-400">{row.category}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-500">
                                            {row.hasKnowledge ? (
                                                <span className={row.roadmapSteps < 10 ? "font-semibold text-amber-600" : ""}>
                                                    {row.roadmapSteps} steps
                                                </span>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-500">{row.difficulty ?? "—"}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{row.salary ?? "—"}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{formatDate(row.aiGeneratedDate)}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-4 text-xs font-bold uppercase tracking-widest">
                                                {row.hasKnowledge ? (
                                                    <>
                                                        <button
                                                            disabled={rowPending}
                                                            onClick={() =>
                                                                runAction(
                                                                    row.jobRoleId,
                                                                    () => handleRegenerateCareerKnowledge(row.jobRoleId),
                                                                    "regenerated",
                                                                )
                                                            }
                                                            className="text-[#5a7a1e] hover:opacity-70 transition-opacity disabled:opacity-40"
                                                        >
                                                            {rowPending ? "Working…" : "Regenerate"}
                                                        </button>
                                                        <button
                                                            disabled={rowPending}
                                                            onClick={() => setTarget(row)}
                                                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        disabled={rowPending}
                                                        onClick={() =>
                                                            runAction(
                                                                row.jobRoleId,
                                                                () => handleGenerateCareerKnowledge(row.jobRoleId),
                                                                "generated",
                                                            )
                                                        }
                                                        className="text-[#5a7a1e] hover:opacity-70 transition-opacity disabled:opacity-40"
                                                    >
                                                        {rowPending ? "Generating…" : "Generate"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Modal open={!!target} onClose={() => setTarget(null)} title="Delete Career Knowledge">
                    <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                        Are you sure you want to delete the generated career knowledge for{" "}
                        <span className="font-semibold text-gray-900">{target?.jobRoleTitle}</span>? This affects
                        every user&apos;s readiness score and roadmap for this role until it&apos;s regenerated.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTarget(null)}
                            className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 hover:border-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex-1 h-10 rounded-lg bg-red-500 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
