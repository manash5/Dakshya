"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { opportunitySchema } from "./schema";
import { handleCreateOpportunity } from "@/lib/actions/admin/opportunity-action";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function OpportunityForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(opportunitySchema),
        defaultValues: {
            title: "",
            organizer: "",
            category: "",
            location: "",
            eventDate: "",
            description: "",
            registrationLink: "",
            source: "admin",
            postedDate: "",
            isActive: true,
        },
    });

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const result = await handleCreateOpportunity(data);

                if (!result.success) throw new Error(result.message);
                toast.success("Opportunity created successfully");
                router.push("/admin/opportunities");
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
                    <h2 className="text-2xl font-bold text-gray-900">Create Opportunity</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Add an opportunity manually — it will show up alongside scraped ones
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
                            <input {...register("title")} placeholder="Opportunity title" className={fieldClass} />
                            {errors.title && <span className={errClass}>{String(errors.title.message)}</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Organizer</label>
                                <input {...register("organizer")} placeholder="Organizer" className={fieldClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Category</label>
                                <input {...register("category")} placeholder="e.g. Hackathon" className={fieldClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Location</label>
                                <input {...register("location")} placeholder="e.g. Online, Kathmandu" className={fieldClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Event Date</label>
                                <input {...register("eventDate")} placeholder="e.g. Aug 15, 2026" className={fieldClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Source</label>
                                <input {...register("source")} placeholder="e.g. admin" className={fieldClass} />
                                {errors.source && <span className={errClass}>{String(errors.source.message)}</span>}
                            </div>

                            <div>
                                <label className={labelClass}>Posted Date</label>
                                <input {...register("postedDate")} placeholder="e.g. Jul 1, 2026" className={fieldClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Registration Link</label>
                            <input {...register("registrationLink")} placeholder="https://..." className={fieldClass} />
                            {errors.registrationLink && <span className={errClass}>{String(errors.registrationLink.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                {...register("description")}
                                placeholder="Opportunity description"
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isPending}
                        className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-[#5a7a1e] text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? "Creating..." : "Create Opportunity"}
                    </button>
                </form>
            </div>
        </div>
    );
}
