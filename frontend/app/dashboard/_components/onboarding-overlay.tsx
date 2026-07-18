"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/context/UserContext";
import {
    submitOnboarding,
    getUniversities,
    getCoursesByUniversity,
    getJobRoles,
} from "@/lib/actions/onboarding-action";
import type { University, Course, JobRole } from "@/lib/api/onboarding";

const STEPS = [
    { label: "About you" },
    { label: "University" },
    { label: "Course" },
    { label: "Semester" },
    { label: "Goals" },
];

const CHEVRON_BG =
    "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23737373%22><path d=%22M5.25 7.5L10 12.25 14.75 7.5H5.25z%22/></svg>')]";

export default function OnboardingOverlay() {
    const { markOnboardingComplete } = useUser();

    const [step, setStep] = useState(1);
    const totalSteps = STEPS.length;

    const [age, setAge] = useState<number | "">("");
    const [universityId, setUniversityId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [currentSemester, setCurrentSemester] = useState<number | "">("");
    const [targetRoles, setTargetRoles] = useState<string[]>([]);

    const [universities, setUniversities] = useState<University[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);

    const [loadingOptions, setLoadingOptions] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Load universities + job roles once
    useEffect(() => {
        (async () => {
            setLoadingOptions(true);
            try {
                const [uniData, roleData] = await Promise.all([
                    getUniversities(),
                    getJobRoles(),
                ]);
                setUniversities(uniData);
                setJobRoles(roleData);
            } catch (err) {
                setError("Failed to load onboarding options. Please refresh.");
            } finally {
                setLoadingOptions(false);
            }
        })();
    }, []);

    // Load courses whenever university changes
    useEffect(() => {
        if (!universityId) {
            setCourses([]);
            return;
        }
        (async () => {
            try {
                const courseData = await getCoursesByUniversity(universityId);
                setCourses(courseData);
            } catch (err) {
                setError("Failed to load courses for selected university.");
            }
        })();
    }, [universityId]);

    const selectedCourse = courses.find((c) => c._id === courseId);
    const maxSemester = selectedCourse?.durationInSemesters ?? 8;

    const canGoNext = () => {
        switch (step) {
            case 1:
                return typeof age === "number" && age > 0;
            case 2:
                return !!universityId;
            case 3:
                return !!courseId;
            case 4:
                return typeof currentSemester === "number" && currentSemester >= 1;
            case 5:
                return targetRoles.length > 0;
            default:
                return false;
        }
    };

    const toggleTargetRole = (id: string) => {
        setTargetRoles((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!canGoNext()) return;
        setSubmitting(true);
        setError("");

        const result = await submitOnboarding({
            age: age as number,
            universityId,
            courseId,
            currentSemester: currentSemester as number,
            targetRoles,
        });

        setSubmitting(false);

        if (result.success) {
            markOnboardingComplete();
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-black/10">
                {/* Progress bar */}
                <div className="h-1 w-full bg-neutral-100">
                    <div
                        className="h-1 bg-neutral-900 transition-all duration-300 ease-out"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                                Step {step} of {totalSteps}
                            </p>
                            <h2 className="mt-1 text-xl font-semibold text-neutral-900">
                                {STEPS[step - 1].label}
                            </h2>
                        </div>
                        <div className="flex gap-1.5">
                            {STEPS.map((_, i) => (
                                <span
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                        i + 1 <= step ? "bg-neutral-900" : "bg-neutral-200"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {loadingOptions ? (
                        <div className="flex items-center gap-2 py-8 text-sm text-neutral-400">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                            Loading options…
                        </div>
                    ) : (
                        <div className="min-h-[160px]">
                            {step === 1 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        How old are you?
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) =>
                                            setAge(e.target.value === "" ? "" : Number(e.target.value))
                                        }
                                        placeholder="e.g. 20"
                                        min={1}
                                        style={{ colorScheme: "light" }}
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white"
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Select your university
                                    </label>
                                    <select
                                        value={universityId}
                                        onChange={(e) => {
                                            setUniversityId(e.target.value);
                                            setCourseId("");
                                        }}
                                        style={{ colorScheme: "light" }}
                                        className={`w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 ${CHEVRON_BG} bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white`}
                                    >
                                        <option value="">Choose a university</option>
                                        {universities.map((u) => (
                                            <option key={u._id} value={u._id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Select your course
                                    </label>
                                    <select
                                        value={courseId}
                                        onChange={(e) => setCourseId(e.target.value)}
                                        style={{ colorScheme: "light" }}
                                        className={`w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 ${CHEVRON_BG} bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white`}
                                    >
                                        <option value="">Choose a course</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {step === 4 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Current semester
                                    </label>
                                    <select
                                        value={currentSemester}
                                        onChange={(e) => setCurrentSemester(Number(e.target.value))}
                                        style={{ colorScheme: "light" }}
                                        className={`w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 ${CHEVRON_BG} bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:bg-white`}
                                    >
                                        <option value="">Choose semester</option>
                                        {Array.from({ length: maxSemester }, (_, i) => i + 1).map(
                                            (sem) => (
                                                <option key={sem} value={sem}>
                                                    Semester {sem}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            )}

                            {step === 5 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Target roles
                                    </label>
                                    <JobRoleDropdown
                                        roles={jobRoles}
                                        selected={targetRoles}
                                        onToggle={toggleTargetRole}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="mt-8 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={step === 1}
                            onClick={() => setStep((s) => s - 1)}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-0"
                        >
                            Back
                        </button>

                        {step < totalSteps ? (
                            <button
                                type="button"
                                disabled={!canGoNext()}
                                onClick={() => setStep((s) => s + 1)}
                                className="rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={!canGoNext() || submitting}
                                onClick={handleSubmit}
                                className="rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                {submitting ? "Saving…" : "Finish setup"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function JobRoleDropdown({
    roles,
    selected,
    onToggle,
}: {
    roles: JobRole[];
    selected: string[];
    onToggle: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedTitles = roles
        .filter((r) => selected.includes(r._id))
        .map((r) => r.title);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-left text-sm outline-none transition-colors focus:border-neutral-900"
            >
                <span
                    className={
                        selectedTitles.length ? "text-neutral-900" : "text-neutral-400"
                    }
                >
                    {selectedTitles.length === 0
                        ? "Choose target roles"
                        : selectedTitles.length <= 2
                        ? selectedTitles.join(", ")
                        : `${selectedTitles.length} roles selected`}
                </span>
                <svg
                    className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M5.25 7.5L10 12.25 14.75 7.5H5.25z" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg shadow-black/5">
                    {roles.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-neutral-400">No roles available</p>
                    ) : (
                        roles.map((role) => {
                            const isSelected = selected.includes(role._id);
                            return (
                                <button
                                    key={role._id}
                                    type="button"
                                    onClick={() => onToggle(role._id)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        isSelected
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-700 hover:bg-neutral-100"
                                    }`}
                                >
                                    <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                            isSelected
                                                ? "border-white bg-white"
                                                : "border-neutral-300"
                                        }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="h-3 w-3 text-neutral-900"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
                                            </svg>
                                        )}
                                    </span>
                                    {role.title}
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {selected.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {roles
                        .filter((r) => selected.includes(r._id))
                        .map((r) => (
                            <span
                                key={r._id}
                                className="flex items-center gap-1.5 rounded-full bg-neutral-100 py-1 pl-3 pr-2 text-xs font-medium text-neutral-700"
                            >
                                {r.title}
                                <button
                                    type="button"
                                    onClick={() => onToggle(r._id)}
                                    className="rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
                                >
                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                </div>
            )}
        </div>
    );
}