"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { updateJobPostingSchema } from "./schema";
import { handleUpdateJobPosting } from "@/lib/actions/admin/jobPosting-action";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function JobPostingFormEdit({ job }: { job: any }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(updateJobPostingSchema),
        defaultValues: {
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            experience: job.experience ?? "",
            employmentType: job.employmentType ?? "",
            requiredSkills: (job.requiredSkills ?? []).join(", "),
            description: job.description ?? "",
            applyLink: job.applyLink,
            source: job.source,
            isActive: job.isActive,
        },
    });

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const payload = {
                    ...data,
                    requiredSkills: data.requiredSkills
                        ? data.requiredSkills.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [],
                };

                const result = await handleUpdateJobPosting(job._id, payload);

                if (!result.success) throw new Error(result.message);
                toast.success("Job posting updated successfully");
                router.push("/admin/job-postings");
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
                    <h2 className="text-2xl font-bold text-gray-900">Edit Job Posting</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {job.jobRole?.title ? `For ${job.jobRole.title}` : "Update job posting information"}
                    </p>
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
                            <input {...register("title")} placeholder="Job title" className={fieldClass} />
                            {errors.title && <span className={errClass}>{String(errors.title.message)}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Company</label>
                                <input {...register("company")} placeholder="Company" className={fieldClass} />
                                {errors.company && <span className={errClass}>{String(errors.company.message)}</span>}
                            </div>

                            <div>
                                <label className={labelClass}>Location</label>
                                <input {...register("location")} placeholder="Location" className={fieldClass} />
                                {errors.location && <span className={errClass}>{String(errors.location.message)}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Salary</label>
                                <input {...register("salary")} placeholder="e.g. NRs 40,000 - 60,000" className={fieldClass} />
                                {errors.salary && <span className={errClass}>{String(errors.salary.message)}</span>}
                            </div>

                            <div>
                                <label className={labelClass}>Experience</label>
                                <input {...register("experience")} placeholder="e.g. 1-2 years" className={fieldClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Employment Type</label>
                                <input {...register("employmentType")} placeholder="e.g. Full-time" className={fieldClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Source</label>
                                <input {...register("source")} placeholder="e.g. merojob" className={fieldClass} />
                                {errors.source && <span className={errClass}>{String(errors.source.message)}</span>}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Apply Link</label>
                            <input {...register("applyLink")} placeholder="https://..." className={fieldClass} />
                            {errors.applyLink && <span className={errClass}>{String(errors.applyLink.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Required Skills</label>
                            <input
                                {...register("requiredSkills")}
                                placeholder="Comma-separated, e.g. SQL, Excel, Power BI"
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                {...register("description")}
                                placeholder="Job description"
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Is Active</label>
                            <input
                                type="checkbox"
                                {...register("isActive")}
                                className="h-4 w-4 rounded border-gray-300"
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
                            {isPending ? "Updating..." : "Update Job Posting"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
