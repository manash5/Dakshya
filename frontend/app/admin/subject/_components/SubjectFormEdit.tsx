"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { updateSubjectSchema } from "./schema";
import { handleUpdateSubject } from "@/lib/actions/admin/subject-action";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function SubjectFormEdit({ subject }: { subject: any }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(updateSubjectSchema),
        defaultValues: {
            courseId: subject.courseId?._id || subject.courseId,
            semester: subject.semester,
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            description: subject.description,
        },
    });

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const payload = {
                    ...data,
                    semester: parseInt(data.semester),
                    credits: parseInt(data.credits),
                };
                const result = await handleUpdateSubject(subject._id, payload);

                if (!result.success) throw new Error(result.message);
                toast.success("Subject updated successfully");
                router.push("/admin/subject");
                router.refresh();
            } catch (err: any) {
                toast.error(err?.message);
                setError(err?.message || "Something went wrong");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8">
                <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Subject</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Update subject information</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Course ID</label>
                            <input
                                {...register("courseId")}
                                placeholder="Enter course ID"
                                className={fieldClass}
                            />
                            {errors.courseId && <span className={errClass}>{String(errors.courseId.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Semester</label>
                            <input
                                {...register("semester", { valueAsNumber: true })}
                                type="number"
                                min="1"
                                placeholder="Enter semester"
                                className={fieldClass}
                            />
                            {errors.semester && <span className={errClass}>{String(errors.semester.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Code</label>
                            <input
                                {...register("code")}
                                placeholder="Enter subject code"
                                className={fieldClass}
                            />
                            {errors.code && <span className={errClass}>{String(errors.code.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Name</label>
                            <input
                                {...register("name")}
                                placeholder="Enter subject name"
                                className={fieldClass}
                            />
                            {errors.name && <span className={errClass}>{String(errors.name.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Credits</label>
                            <input
                                {...register("credits", { valueAsNumber: true })}
                                type="number"
                                min="1"
                                placeholder="Enter credits"
                                className={fieldClass}
                            />
                            {errors.credits && <span className={errClass}>{String(errors.credits.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                {...register("description")}
                                placeholder="Enter subject description"
                                rows={3}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white"
                            />
                        </div>
                    </div>

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
                            disabled={isPending || isSubmitting}
                            className="flex-1 h-12 rounded-lg bg-[#5a7a1e] text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? "Updating..." : "Update Subject"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
