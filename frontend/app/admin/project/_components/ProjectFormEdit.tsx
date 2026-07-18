"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { updateProjectSchema } from "./schema";
import { handleUpdateProject } from "@/lib/actions/admin/project-action";
import type { JobRole } from "@/lib/api/onboarding";
import type { Project } from "@/lib/api/project";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const textareaClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function ProjectFormEdit({ project, jobRoles }: { project: Project; jobRoles: JobRole[] }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            title: project.title,
            description: project.description,
            difficulty: project.difficulty,
            skills: (project.skills ?? []).join(", "),
            requirements: (project.requirements ?? []).join("\n"),
            githubTemplate: project.githubTemplate ?? "",
            estimatedHours: project.estimatedHours,
            careerRole: project.careerRole?._id ?? "",
            isActive: project.isActive,
        },
    });

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const payload = {
                    ...data,
                    skills: data.skills
                        ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                    requirements: data.requirements
                        ? data.requirements.split("\n").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                    githubTemplate: data.githubTemplate?.trim() || null,
                };

                const result = await handleUpdateProject(project._id, payload);

                if (!result.success) throw new Error(result.message);
                toast.success("Project updated successfully");
                router.push("/admin/project");
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
                    <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Update project information</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Title</label>
                            <input {...register("title")} className={fieldClass} />
                            {errors.title && <span className={errClass}>{String(errors.title.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea {...register("description")} rows={4} className={textareaClass} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Career Role</label>
                                <select {...register("careerRole")} className={fieldClass}>
                                    <option value="">Select a role</option>
                                    {jobRoles.map((role) => (
                                        <option key={role._id} value={role._id}>{role.title}</option>
                                    ))}
                                </select>
                                {errors.careerRole && <span className={errClass}>{String(errors.careerRole.message)}</span>}
                            </div>

                            <div>
                                <label className={labelClass}>Difficulty</label>
                                <select {...register("difficulty")} className={fieldClass}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Estimated Hours</label>
                                <input type="number" {...register("estimatedHours")} className={fieldClass} />
                                {errors.estimatedHours && <span className={errClass}>{String(errors.estimatedHours.message)}</span>}
                            </div>

                            <div>
                                <label className={labelClass}>GitHub Template (optional)</label>
                                <input {...register("githubTemplate")} placeholder="https://github.com/..." className={fieldClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Skills</label>
                            <input {...register("skills")} className={fieldClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Requirements</label>
                            <textarea {...register("requirements")} rows={4} className={textareaClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Is Active</label>
                            <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-gray-300" />
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
                            {isPending ? "Updating..." : "Update Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
