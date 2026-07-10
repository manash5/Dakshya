"use client";

import Link from "next/link";
import { useState } from "react";
import type {
    CourseResult,
    GenerateCoursesError,
    GenerateCoursesResponse,
} from "@/lib/api/ai/course-generator";

type SyncPhase = "idle" | "creating" | "syncing" | "done" | "error";

interface CourseSyncStatusProps {
    phase: SyncPhase;
    syncResult: GenerateCoursesResponse | null;
    syncError: GenerateCoursesError | null;
    universityId: string | null;
    onDone: () => void;
}

function countCreatedCourses(results: CourseResult[]) {
    return results.filter((r) => r.status === "created").length;
}

function countFailedCourses(results: CourseResult[]) {
    return results.filter((r) => r.status !== "created").length;
}

function countCreatedSubjects(results: CourseResult[]) {
    return results.reduce(
        (total, course) =>
            total + course.subjects.filter((s) => s.status === "created").length,
        0
    );
}

function CourseResultRow({ result }: { result: CourseResult }) {
    const [expanded, setExpanded] = useState(false);
    const createdSubjects = result.subjects.filter((s) => s.status === "created").length;
    const failedSubjects = result.subjects.filter((s) => s.status !== "created").length;

    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div className="flex items-center gap-2">
                    <span>{result.status === "created" ? "✅" : "❌"}</span>
                    <span className="text-sm font-medium text-gray-900">{result.input.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {result.subjects.length > 0 && (
                        <span>
                            {createdSubjects} subject{createdSubjects !== 1 ? "s" : ""} created
                            {failedSubjects > 0 ? `, ${failedSubjects} failed` : ""}
                        </span>
                    )}
                    {result.subjects.length > 0 && (
                        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
                    )}
                </div>
            </button>

            {result.error && (
                <p className="px-4 pb-3 text-xs text-red-500">{result.error}</p>
            )}

            {expanded && result.subjects.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-3">
                    <ul className="space-y-1.5">
                        {result.subjects.map((subject, idx) => (
                            <li
                                key={`${subject.input.code}-${idx}`}
                                className="flex items-start gap-2 text-xs text-gray-600"
                            >
                                <span className="mt-0.5 shrink-0">
                                    {subject.status === "created" ? "✅" : "❌"}
                                </span>
                                <span>
                                    <span className="font-medium text-gray-800">
                                        Sem {subject.input.semester} · {subject.input.code}
                                    </span>{" "}
                                    — {subject.input.name}
                                    {subject.error && (
                                        <span className="block text-red-500">{subject.error}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function CourseSyncStatus({
    phase,
    syncResult,
    syncError,
    universityId,
    onDone,
}: CourseSyncStatusProps) {
    if (phase === "idle") return null;

    const isWorking = phase === "creating" || phase === "syncing";

    return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {isWorking && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#5a7a1e]" />
                        <span>
                            {phase === "creating"
                                ? "Creating university..."
                                : "University created. Syncing courses from the website — this can take a minute..."}
                        </span>
                    </div>
                    {phase === "syncing" && (
                        <p className="text-xs text-gray-400">
                            Crawling the website and importing courses with AI. This can take several
                            minutes for large sites — please keep this page open.
                        </p>
                    )}
                </div>
            )}

            {phase === "error" && syncError && (
                <div className="space-y-3">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <p className="font-medium">University created successfully</p>
                        <p className="mt-1">{syncError.message}</p>
                    </div>
                    {universityId && (
                        <div className="flex gap-3">
                            <Link
                                href={`/admin/university/${universityId}/edit`}
                                className="inline-flex h-10 items-center rounded-lg bg-[#5a7a1e] px-5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                            >
                                Go to university
                            </Link>
                            <button
                                type="button"
                                onClick={onDone}
                                className="inline-flex h-10 items-center rounded-lg border border-gray-200 px-5 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-900"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            )}

            {phase === "done" && syncResult && (
                <div className="space-y-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        <p className="font-medium">University created successfully</p>
                        <p className="mt-1">
                            Found {syncResult.coursesFound} course
                            {syncResult.coursesFound !== 1 ? "s" : ""} —{" "}
                            {countCreatedCourses(syncResult.results)} created,{" "}
                            {countFailedCourses(syncResult.results)} failed.{" "}
                            {countCreatedSubjects(syncResult.results)} subject
                            {countCreatedSubjects(syncResult.results) !== 1 ? "s" : ""} created.
                        </p>
                    </div>

                    {syncResult.results.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Course import details
                            </p>
                            {syncResult.results.map((result, idx) => (
                                <CourseResultRow key={`${result.input.name}-${idx}`} result={result} />
                            ))}
                        </div>
                    )}

                    {syncResult.results.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No courses were detected on the website. You can add courses manually from the
                            university edit page.
                        </p>
                    )}

                    {universityId && (
                        <div className="flex gap-3 pt-1">
                            <Link
                                href={`/admin/university/${universityId}/edit`}
                                className="inline-flex h-10 items-center rounded-lg bg-[#5a7a1e] px-5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                            >
                                Go to university
                            </Link>
                            <button
                                type="button"
                                onClick={onDone}
                                className="inline-flex h-10 items-center rounded-lg border border-gray-200 px-5 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-900"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
