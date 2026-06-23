"use client";

import Link from "next/link";
import { Bell, Clock3, GraduationCap, LockKeyhole, PencilLine, Shield } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { formatRelativeDate } from "./profile-types";
import PasswordChangeForm from "./PasswordChangeForm";

type ProfileSideCardsProps = {
    profileScore: number;
    twoFactorEnabled: boolean;
    setTwoFactorEnabled: Dispatch<SetStateAction<boolean>>;
    mockInterviewsEnabled: boolean;
    setMockInterviewsEnabled: Dispatch<SetStateAction<boolean>>;
    jobMatchesEnabled: boolean;
    setJobMatchesEnabled: Dispatch<SetStateAction<boolean>>;
    roadmapUpdatesEnabled: boolean;
    setRoadmapUpdatesEnabled: Dispatch<SetStateAction<boolean>>;
    updatedAt?: string;
};

function ToggleRow({
    label,
    description,
    enabled,
    onToggle,
}: {
    label: string;
    description?: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition hover:bg-slate-50"
        >
            <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                {description ? (
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{description}</p>
                ) : null}
            </div>
            <span className={`relative h-5 w-9 rounded-full transition ${enabled ? "bg-slate-900" : "bg-slate-200"}`} aria-hidden="true">
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? "left-4" : "left-0.5"}`} />
            </span>
        </button>
    );
}

export default function ProfileSideCards({
    profileScore,
    twoFactorEnabled,
    setTwoFactorEnabled,
    mockInterviewsEnabled,
    setMockInterviewsEnabled,
    jobMatchesEnabled,
    setJobMatchesEnabled,
    roadmapUpdatesEnabled,
    setRoadmapUpdatesEnabled,
    updatedAt,
}: ProfileSideCardsProps) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
                <aside className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Career Preferences</h2>
                            <p className="mt-1 text-sm text-slate-500">A snapshot of your current focus</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-lime-200 bg-lime-50 text-lime-700">
                            <PencilLine size={18} strokeWidth={1.9} />
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-2xl border border-lime-100 bg-lime-50/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Current Target</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Frontend Developer</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Goal Deadline</p>
                                    <p className="mt-2 text-lg font-semibold text-slate-900">3 Months</p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                                    <Clock3 size={17} strokeWidth={1.9} />
                                </div>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-slate-900 to-lime-500 transition-all"
                                    style={{ width: `${Math.max(30, profileScore)}%` }}
                                />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                <span>Profile strength</span>
                                <span>{profileScore}%</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                            <GraduationCap size={18} strokeWidth={1.9} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">Academic Info</h3>
                    </div>

                    <dl className="mt-6 space-y-5 text-sm">
                        <div>
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Degree</dt>
                            <dd className="mt-2 text-base font-semibold text-slate-900">B.Sc. Computer Science</dd>
                        </div>

                        <div>
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">University</dt>
                            <dd className="mt-2 text-base font-semibold text-slate-900">Kathmandu University</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                        Edit Education
                    </button>
                </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <section className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                            <Bell size={18} strokeWidth={1.9} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
                    </div>

                    <div className="mt-5 space-y-1">
                        <ToggleRow
                            label="Mock Interviews"
                            enabled={mockInterviewsEnabled}
                            onToggle={() => setMockInterviewsEnabled((current) => !current)}
                        />
                        <ToggleRow
                            label="Job Matches"
                            enabled={jobMatchesEnabled}
                            onToggle={() => setJobMatchesEnabled((current) => !current)}
                        />
                        <ToggleRow
                            label="Roadmap Updates"
                            enabled={roadmapUpdatesEnabled}
                            onToggle={() => setRoadmapUpdatesEnabled((current) => !current)}
                        />
                    </div>
                </section>

                <section className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                            <Shield size={18} strokeWidth={1.9} />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">Security</h3>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Two-Factor Auth</p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Extra security layer</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setTwoFactorEnabled((current) => !current)}
                                className={`relative mt-1 h-5 w-9 rounded-full transition ${twoFactorEnabled ? "bg-slate-900" : "bg-slate-200"}`}
                                aria-pressed={twoFactorEnabled}
                                aria-label="Toggle two-factor authentication"
                            >
                                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${twoFactorEnabled ? "left-4" : "left-0.5"}`} />
                            </button>
                        </div>
                    </div>

                    <PasswordChangeForm />
                </section>

                <div className="flex flex-col gap-3 pt-1 text-xs text-slate-500 lg:col-span-1 lg:self-end">
                    <p>Last profile update: {formatRelativeDate(updatedAt)}</p>
                    <div className="flex items-center gap-4">
                        <button type="button" className="transition hover:text-slate-800">Privacy Policy</button>
                        <button type="button" className="transition hover:text-slate-800">Terms of Service</button>
                    </div>
                </div>
            </div>
        </>
    );
}