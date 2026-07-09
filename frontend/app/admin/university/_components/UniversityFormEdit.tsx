"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { updateUniversitySchema } from "./schema";
import { handleUpdateUniversity } from "@/lib/actions/admin/university-action";

const fieldClass =
    "h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500";
const errClass = "mt-1 block text-sm text-red-500";

export default function UniversityFormEdit({ university }: { university: any }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(updateUniversitySchema),
        defaultValues: {
            name: university.name,
            shortName: university.shortName,
            country: university.country,
            website: university.website,
            isActive: university.isActive,
        },
    });

    const onSubmit = (data: any) => {
        setError("");
        startTransition(async () => {
            try {
                const result = await handleUpdateUniversity(university._id, data);

                if (!result.success) throw new Error(result.message);
                toast.success("University updated successfully");
                router.push("/admin/university");
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
                    <h2 className="text-2xl font-bold text-gray-900">Edit University</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Update university information</p>
                </div>

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
                            />
                            {errors.name && <span className={errClass}>{String(errors.name.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Short Name</label>
                            <input
                                {...register("shortName")}
                                placeholder="Enter short name"
                                className={fieldClass}
                            />
                            {errors.shortName && <span className={errClass}>{String(errors.shortName.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Country</label>
                            <input
                                {...register("country")}
                                placeholder="Enter country"
                                className={fieldClass}
                            />
                            {errors.country && <span className={errClass}>{String(errors.country.message)}</span>}
                        </div>

                        <div>
                            <label className={labelClass}>Website</label>
                            <input
                                {...register("website")}
                                placeholder="https://example.com"
                                className={fieldClass}
                            />
                            {errors.website && <span className={errClass}>{String(errors.website.message)}</span>}
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
                            {isPending ? "Updating..." : "Update University"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
