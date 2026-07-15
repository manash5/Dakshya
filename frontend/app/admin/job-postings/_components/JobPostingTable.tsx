"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import Modal from "../../_components/Modal";
import ScrapeLoading from "./ScrapeLoading";
import { handleDeleteJobPosting, handleScrapeJobPostings } from "@/lib/actions/admin/jobPosting-action";

interface ScrapeStat {
    totalScraped: number;
    created: number;
    updated: number;
    skipped: number;
    deactivated: number;
    sourcesSucceeded: string[];
    sourcesFailed: Record<string, string>;
}

export default function JobPostingTable({
    data,
    pagination,
    search,
}: {
    data: any[];
    pagination: any;
    search: string;
}) {
    const router = useRouter();
    const params = useSearchParams();
    const [isDeleting, startDelete] = useTransition();
    const [isScraping, startScrape] = useTransition();
    const [target, setTarget] = useState<any | null>(null);
    const [scrapeStats, setScrapeStats] = useState<ScrapeStat | null>(null);

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const totalPages = pagination?.totalPages ?? 1;
    const total = pagination?.total ?? 0;

    const setQuery = (next: Record<string, string | number>) => {
        const q = new URLSearchParams(params.toString());
        Object.entries(next).forEach(([k, v]) => q.set(k, String(v)));
        router.push(`/admin/job-postings?${q.toString()}`);
    };

    const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get("search") as string;
        setQuery({ search: value ?? "", page: 1 });
    };

    const onDelete = () => {
        if (!target) return;
        startDelete(async () => {
            const result = await handleDeleteJobPosting(target._id);
            if (result.success) {
                toast.success("Job posting deleted");
                setTarget(null);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to delete job posting");
            }
        });
    };

    const onScrape = () => {
        setScrapeStats(null);
        startScrape(async () => {
            const result = await handleScrapeJobPostings();
            if (result.success) {
                toast.success("Job postings refreshed");
                setScrapeStats(result.data ?? null);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to scrape job postings");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md p-8">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
                    </div>
                    <button
                        onClick={onScrape}
                        disabled={isScraping}
                        className="inline-flex items-center rounded-lg bg-[#5a7a1e] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isScraping ? "Scraping..." : "Scrape Jobs"}
                    </button>
                </div>

                {isScraping && <ScrapeLoading />}

                {scrapeStats && (
                    <div className="mb-6 space-y-2 rounded-xl border border-gray-100 p-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Scrape results
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                            <span className="font-medium text-gray-900">
                                {scrapeStats.totalScraped} jobs from {scrapeStats.sourcesSucceeded.join(", ") || "no sources"}
                            </span>
                            <span className="text-gray-500">
                                {scrapeStats.created} created, {scrapeStats.updated} updated, {scrapeStats.skipped} skipped,{" "}
                                {scrapeStats.deactivated} deactivated
                            </span>
                        </div>
                        {Object.keys(scrapeStats.sourcesFailed).length > 0 && (
                            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-500">
                                Failed: {Object.entries(scrapeStats.sourcesFailed)
                                    .map(([name, err]) => `${name} (${err})`)
                                    .join(", ")}
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={onSearch} className="flex w-full max-w-lg gap-2">
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search title, company, description..."
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
                                <th className="px-5 py-3 font-semibold">Company</th>
                                <th className="px-5 py-3 font-semibold">Job Role</th>
                                <th className="px-5 py-3 font-semibold">Location</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.length ? (
                                data.map((j) => (
                                    <tr key={j._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-gray-900">{j.title}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{j.company}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{j.jobRole?.title ?? "—"}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{j.location}</td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                                    j.isActive
                                                        ? "bg-[#C6EF54] text-[#4a6a10]"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {j.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-4 text-xs font-bold uppercase tracking-widest">
                                                <Link href={`/admin/job-postings/${j._id}/edit`} className="text-gray-400 hover:text-gray-900 transition-colors">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setTarget(j)}
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
                                        No job postings found. Try scraping to populate this list.
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

                <Modal open={!!target} onClose={() => setTarget(null)} title="Delete Job Posting">
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
                            disabled={isDeleting}
                            className="flex-1 h-10 rounded-lg bg-red-500 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
