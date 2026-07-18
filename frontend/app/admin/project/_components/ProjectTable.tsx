"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import Modal from "../../_components/Modal";
import { handleDeleteProject } from "@/lib/actions/admin/project-action";
import type { Project } from "@/lib/api/project";

export default function ProjectTable({
    data,
    pagination,
    search,
}: {
    data: Project[];
    pagination: any;
    search: string;
}) {
    const router = useRouter();
    const params = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [target, setTarget] = useState<Project | null>(null);

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const totalPages = pagination?.totalPages ?? 1;
    const total = pagination?.total ?? 0;

    const setQuery = (next: Record<string, string | number>) => {
        const q = new URLSearchParams(params.toString());
        Object.entries(next).forEach(([k, v]) => q.set(k, String(v)));
        router.push(`/admin/project?${q.toString()}`);
    };

    const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get("search") as string;
        setQuery({ search: value ?? "", page: 1 });
    };

    const onDelete = () => {
        if (!target) return;
        startTransition(async () => {
            const result = await handleDeleteProject(target._id);
            if (result.success) {
                toast.success("Project deleted");
                setTarget(null);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to delete project");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
                    </div>
                    <Link
                        href="/admin/project/create"
                        className="inline-flex items-center rounded-lg bg-[#5a7a1e] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                    >
                        New Project
                    </Link>
                </div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={onSearch} className="flex w-full max-w-lg gap-2">
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search projects..."
                            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                        />
                        <button className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 hover:border-gray-400">
                            Search
                        </button>
                    </form>

                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Rows
                        <select
                            value={limit}
                            onChange={(e) => setQuery({ limit: e.target.value, page: 1 })}
                            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400"
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Title</th>
                                <th className="px-5 py-3 font-semibold">Career Role</th>
                                <th className="px-5 py-3 font-semibold">Difficulty</th>
                                <th className="px-5 py-3 font-semibold">Hours</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.length ? (
                                data.map((p) => (
                                    <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-gray-900">{p.title}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{p.careerRole?.title ?? "—"}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{p.difficulty}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{p.estimatedHours}h</td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                                    p.isActive
                                                        ? "bg-[#C6EF54] text-[#4a6a10]"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {p.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-4 text-xs font-bold uppercase tracking-widest">
                                                <Link href={`/admin/project/${p._id}/edit`} className="text-gray-400 hover:text-gray-900 transition-colors">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setTarget(p)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-14 text-center text-gray-400 text-sm">
                                        No projects found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-widest">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setQuery({ page: page - 1 })}
                            className="h-9 rounded-lg border border-gray-200 px-4 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 hover:border-gray-400 disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setQuery({ page: page + 1 })}
                            className="h-9 rounded-lg border border-gray-200 px-4 text-xs font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 hover:border-gray-400 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <Modal open={!!target} onClose={() => setTarget(null)} title="Delete Project">
                    <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-900">
                            {target?.title}
                        </span>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTarget(null)}
                            className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-gray-900 hover:border-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onDelete}
                            disabled={isPending}
                            className="flex-1 h-10 rounded-lg bg-red-500 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
