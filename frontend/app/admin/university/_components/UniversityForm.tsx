"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createUniversitySchema } from "./schema";
import { handleCreateUniversity } from "@/lib/actions/admin/university-action";
import { handleGenerateUniversityCourses } from "@/lib/actions/admin/course-sync-action";
import { GenerateCoursesError, GenerateCoursesResponse } from "@/lib/api/ai/course-generator";
import CourseSyncStatus from "./CourseSyncStatus";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

type SyncPhase = "idle" | "creating" | "syncing" | "done" | "error";

export default function UniversityForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const [syncPhase, setSyncPhase] = useState<SyncPhase>("idle");
    const [syncResult, setSyncResult] = useState<GenerateCoursesResponse | null>(null);
    const [syncError, setSyncError] = useState<GenerateCoursesError | null>(null);
    const [createdUniversityId, setCreatedUniversityId] = useState<string | null>(null);
    const [formLocked, setFormLocked] = useState(false);
    const submitInFlightRef = useRef(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createUniversitySchema),
    });

    const onSubmit = (data: any) => {
        if (submitInFlightRef.current) return;

        submitInFlightRef.current = true;
        setError("");
        setSyncResult(null);
        setSyncError(null);
        setSyncPhase("creating");
        setFormLocked(true);

        startTransition(async () => {
            let step: "creating" | "syncing" = "creating";

            try {
                const result = await handleCreateUniversity(data);

                if (!result.success) throw new Error(result.message);

                const universityId = result.data?._id;
                if (!universityId) throw new Error("University created but no ID returned");

                setCreatedUniversityId(String(universityId));
                toast.success("University created successfully");

                step = "syncing";
                setSyncPhase("syncing");

                const syncResponse = await handleGenerateUniversityCourses({
                    universityId: String(universityId),
                    website: data.website,
                });

                if (!syncResponse.success) {
                    throw new GenerateCoursesError(
                        syncResponse.message,
                        (syncResponse.code as any) || "unknown"
                    );
                }

                setSyncResult(syncResponse.data);
                setSyncPhase("done");
            } catch (err: any) {
                if (step === "creating") {
                    toast.error(err?.message);
                    setError(err?.message || "Something went wrong");
                    setFormLocked(false);
                    setSyncPhase("idle");
                    submitInFlightRef.current = false;
                } else {
                    const mappedError =
                        err instanceof GenerateCoursesError
                            ? err
                            : new GenerateCoursesError(
                                  err?.message || "Course sync failed",
                                  "unknown"
                              );
                    setSyncError(mappedError);
                    setSyncPhase("error");
                }
            }
        });
    };

    const handleDone = () => {
        router.push("/admin/university");
        router.refresh();
    };

    const isWorking = syncPhase === "creating" || syncPhase === "syncing";

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8">
                <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900">Create University</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Add a new university below</p>
                </div>

                <CourseSyncStatus
                    phase={syncPhase}
                    syncResult={syncResult}
                    syncError={syncError}
                    universityId={createdUniversityId}
                    onDone={handleDone}
                />

                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Name</label>
                            <input
                                {...register("name")}
                                placeholder="Enter university name"
                                className={fieldClass}
                                disabled={formLocked}
                            />
                            {errors.name && <span className={errClass}>{String(errors.name.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Short Name</label>
                            <input
                                {...register("shortName")}
                                placeholder="Enter short name"
                                className={fieldClass}
                                disabled={formLocked}
                            />
                            {errors.shortName && <span className={errClass}>{String(errors.shortName.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Country</label>
                            <input
                                {...register("country")}
                                placeholder="Enter country"
                                className={fieldClass}
                                disabled={formLocked}
                            />
                            {errors.country && <span className={errClass}>{String(errors.country.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Website</label>
                            <input
                                {...register("website")}
                                placeholder="https://example.com"
                                className={fieldClass}
                                disabled={formLocked}
                            />
                            {errors.website && <span className={errClass}>{String(errors.website.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Is Active</label>
                            <input
                                type="checkbox"
                                {...register("isActive")}
                                className="h-4 w-4 rounded border-gray-300"
                                defaultChecked={true}
                                disabled={formLocked}
                            />
                        </div>
                    </div>

                    {!formLocked && (
                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 h-12 rounded-lg border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 hover:border-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || isSubmitting || isWorking}
                                className="flex-1 h-12 rounded-lg bg-[#5a7a1e] text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {isPending || isWorking ? "Creating..." : "Create University"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
