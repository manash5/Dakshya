"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createCourseSchema } from "./schema";
import { handleCreateCourse } from "@/lib/actions/admin/course-action";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function CourseForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createCourseSchema),
    });

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const payload = {
                    ...data,
                    durationInSemesters: parseInt(data.durationInSemesters),
                };
                const result = await handleCreateCourse(payload);

                if (!result.success) throw new Error(result.message);
                toast.success("Course created successfully");
                router.push("/admin/course");
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
                    <h2 className="text-2xl font-bold text-gray-900">Create Course</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Add a new course below</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>University ID</label>
                            <input
                                {...register("universityId")}
                                placeholder="Enter university ID"
                                className={fieldClass}
                            />
                            {errors.universityId && <span className={errClass}>{String(errors.universityId.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Name</label>
                            <input
                                {...register("name")}
                                placeholder="Enter course name"
                                className={fieldClass}
                            />
                            {errors.name && <span className={errClass}>{String(errors.name.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Degree</label>
                            <select
                                {...register("degree")}
                                className={fieldClass}
                            >
                                <option value="">Select degree</option>
                                <option value="Bachelor">Bachelor</option>
                                <option value="Master">Master</option>
                            </select>
                            {errors.degree && <span className={errClass}>{String(errors.degree.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Duration (Semesters)</label>
                            <input
                                {...register("durationInSemesters", { valueAsNumber: true })}
                                type="number"
                                min="1"
                                placeholder="Enter duration"
                                className={fieldClass}
                            />
                            {errors.durationInSemesters && <span className={errClass}>{String(errors.durationInSemesters.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                {...register("description")}
                                placeholder="Enter course description"
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white"
                            />
                            {errors.description && <span className={errClass}>{String(errors.description.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Is Active</label>
                            <input
                                type="checkbox"
                                {...register("isActive")}
                                className="h-4 w-4 rounded border-gray-300"
                                defaultChecked={true}
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
                            {isPending ? "Creating..." : "Create Course"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
