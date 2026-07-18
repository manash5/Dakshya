"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Controller, useFormContext } from "react-hook-form";
import { Plus, Target, X } from "lucide-react";

import type { JobRole } from "@/lib/api/onboarding";
import type { UpdateUserData } from "./profile-form";

const SEMESTERS = Array.from({ length: 8 }, (_, i) => i + 1);

export interface RoadmapSnapshot {
    jobRoleId: string;
    jobRole: string;
    completedModules: number;
    totalModules: number;
    progressPercent: number;
}

function AddRoleMenu({ roles, onAdd }: { roles: JobRole[]; onAdd: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (roles.length === 0) return null;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-lime-300 hover:text-lime-800"
            >
                <Plus size={13} /> Add role
            </button>

            {open && (
                <div className="absolute left-0 z-10 mt-2 max-h-56 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-black/5">
                    {roles.map((role) => (
                        <button
                            key={role._id}
                            type="button"
                            onClick={() => {
                                onAdd(role._id);
                                setOpen(false);
                            }}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
                        >
                            {role.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CareerGoalsCard({
    jobRoles,
    roadmapSnapshots,
}: {
    jobRoles: JobRole[];
    roadmapSnapshots: RoadmapSnapshot[];
}) {
    const { control } = useFormContext<UpdateUserData>();
    const snapshotByRole = new Map(roadmapSnapshots.map((s) => [s.jobRoleId, s]));

    return (
        <section className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-lime-50 text-lime-700">
                    <Target size={15} strokeWidth={1.9} />
                </div>
                <h2 className="text-base font-semibold tracking-tight text-slate-900">Career Goals</h2>
            </div>

            <Controller
                name="targetRoles"
                control={control}
                render={({ field }) => {
                    const selectedIds = field.value ?? [];
                    const selectedRoles = jobRoles.filter((r) => selectedIds.includes(r._id));
                    const availableRoles = jobRoles.filter((r) => !selectedIds.includes(r._id));

                    return (
                        <div className="mt-4 space-y-1">
                            {selectedRoles.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400">
                                    No target roles yet
                                </p>
                            ) : (
                                selectedRoles.map((role) => {
                                    const snapshot = snapshotByRole.get(role._id);
                                    return (
                                        <div
                                            key={role._id}
                                            className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
                                        >
                                            <Link
                                                href={`/dashboard/progress?role=${role._id}`}
                                                className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1"
                                            >
                                                <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                                                    {role.title}
                                                </span>
                                                <span className="shrink-0 text-xs font-semibold text-lime-700">
                                                    {snapshot ? `${snapshot.progressPercent}%` : "Not synced yet"}
                                                </span>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    field.onChange(selectedIds.filter((id) => id !== role._id))
                                                }
                                                className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                aria-label={`Remove ${role.title}`}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}

                            <div className="pt-1">
                                <AddRoleMenu
                                    roles={availableRoles}
                                    onAdd={(id) => field.onChange([...selectedIds, id])}
                                />
                            </div>
                        </div>
                    );
                }}
            />

            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3.5">
                <label htmlFor="currentSemester" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Current Semester
                </label>
                <Controller
                    name="currentSemester"
                    control={control}
                    render={({ field }) => (
                        <select
                            id="currentSemester"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            style={{ colorScheme: "light" }}
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-100"
                        >
                            <option value="" disabled>
                                Choose semester
                            </option>
                            {SEMESTERS.map((sem) => (
                                <option key={sem} value={sem}>
                                    Semester {sem}
                                </option>
                            ))}
                        </select>
                    )}
                />
            </div>
        </section>
    );
}
