"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    Briefcase,
    CheckCircle2,
    GraduationCap,
    Lightbulb,
    RefreshCcw,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import type { ResumeAnalysis } from "@/lib/api/resumeAnalysis";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
};

export default function ResumeAnalysisResults({
    analysis,
    onReanalyze,
}: {
    analysis: ResumeAnalysis;
    onReanalyze: () => void;
}) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-[24px] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)]"
        >
            <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">Resume Analysis</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {analysis.originalFileName} · {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onReanalyze}
                    className="flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                    <RefreshCcw size={14} /> Analyze another resume
                </button>
            </motion.div>

            {!analysis.identityMatch && (
                <motion.div
                    variants={item}
                    className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"
                >
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium">This resume may not belong to you</p>
                        <p className="mt-1 text-amber-700">{analysis.identityReason}</p>
                    </div>
                </motion.div>
            )}

            <motion.div variants={item} className="mt-6 flex items-center gap-6 rounded-2xl bg-[#F7F8F5] p-6">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                    <svg className="h-24 w-24 -rotate-90">
                        <circle cx="48" cy="48" r="40" strokeWidth="8" className="fill-none stroke-zinc-200" />
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="fill-none stroke-zinc-900"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - analysis.atsScore / 100)}
                        />
                    </svg>
                    <span className="absolute text-xl font-bold text-zinc-900">{Math.round(analysis.atsScore)}</span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-zinc-900">ATS Compatibility Score</p>
                    <p className="mt-1 text-sm text-zinc-500">
                        How well this resume is likely to parse through Applicant Tracking Systems.
                    </p>
                </div>
            </motion.div>

            {analysis.comparison && (
                <motion.div variants={item} className="mt-6 rounded-2xl border border-zinc-200 p-5">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#8fae1b]" />
                        <p className="text-sm font-semibold text-zinc-900">Progress since your last upload</p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{analysis.comparison.summary}</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {analysis.comparison.improvements.length > 0 && (
                            <ListBlock
                                icon={<TrendingUp size={14} className="text-emerald-600" />}
                                label="Improvements"
                                items={analysis.comparison.improvements}
                            />
                        )}
                        {analysis.comparison.regressions.length > 0 && (
                            <ListBlock
                                icon={<TrendingDown size={14} className="text-rose-500" />}
                                label="Regressions"
                                items={analysis.comparison.regressions}
                            />
                        )}
                    </div>

                    {analysis.comparison.newSkills.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">New skills</p>
                            <ChipList items={analysis.comparison.newSkills} tone="lime" />
                        </div>
                    )}
                </motion.div>
            )}

            <motion.div variants={item} className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Skills detected</p>
                <ChipList items={analysis.skills} tone="zinc" />
            </motion.div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <motion.div variants={item}>
                    <SectionCard
                        icon={<CheckCircle2 size={16} className="text-emerald-600" />}
                        title="Strengths"
                        items={analysis.strengths}
                    />
                </motion.div>
                <motion.div variants={item}>
                    <SectionCard
                        icon={<AlertTriangle size={16} className="text-amber-500" />}
                        title="Weaknesses"
                        items={analysis.weaknesses}
                    />
                </motion.div>
            </div>

            {analysis.experience.length > 0 && (
                <motion.div variants={item} className="mt-6">
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <Briefcase size={16} /> Experience
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                        {analysis.experience.map((exp, i) => (
                            <div key={i} className="rounded-xl border border-zinc-200 p-4">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="text-sm font-medium text-zinc-900">
                                        {exp.title || "Role"}
                                        {exp.company && <span className="text-zinc-500"> · {exp.company}</span>}
                                    </p>
                                    {exp.duration && <p className="text-xs text-zinc-400">{exp.duration}</p>}
                                </div>
                                {exp.description && <p className="mt-1 text-sm text-zinc-600">{exp.description}</p>}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {analysis.education.length > 0 && (
                <motion.div variants={item} className="mt-6">
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <GraduationCap size={16} /> Education
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                        {analysis.education.map((edu, i) => (
                            <div key={i} className="rounded-xl border border-zinc-200 p-4">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="text-sm font-medium text-zinc-900">
                                        {edu.degree || "Program"}
                                        {edu.institution && <span className="text-zinc-500"> · {edu.institution}</span>}
                                    </p>
                                    {edu.duration && <p className="text-xs text-zinc-400">{edu.duration}</p>}
                                </div>
                                {edu.fieldOfStudy && <p className="mt-1 text-sm text-zinc-600">{edu.fieldOfStudy}</p>}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {analysis.projects.length > 0 && (
                <motion.div variants={item} className="mt-6">
                    <p className="text-sm font-semibold text-zinc-900">Projects</p>
                    <div className="mt-3 flex flex-col gap-3">
                        {analysis.projects.map((proj, i) => (
                            <div key={i} className="rounded-xl border border-zinc-200 p-4">
                                <p className="text-sm font-medium text-zinc-900">{proj.title}</p>
                                {proj.description && <p className="mt-1 text-sm text-zinc-600">{proj.description}</p>}
                                {proj.technologies.length > 0 && <ChipList items={proj.technologies} tone="zinc" small />}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {analysis.recommendations.length > 0 && (
                <motion.div variants={item} className="mt-6 rounded-2xl bg-zinc-900 p-5 text-white">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                        <Lightbulb size={16} className="text-[#D9F24A]" /> Recommendations
                    </p>
                    <ul className="mt-3 flex flex-col gap-2">
                        {analysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex gap-2 text-sm text-zinc-300">
                                <span className="text-[#D9F24A]">→</span> {rec}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </motion.div>
    );
}

function SectionCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
    return (
        <div className="h-full rounded-2xl border border-zinc-200 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                {icon} {title}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
                {items.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-600">
                        · {s}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ListBlock({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
    return (
        <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {icon} {label}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
                {items.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-600">
                        · {s}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ChipList({ items, tone, small }: { items: string[]; tone: "zinc" | "lime"; small?: boolean }) {
    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {items.map((s, i) => (
                <span
                    key={i}
                    className={`rounded-full px-3 py-1 font-medium ${small ? "text-xs" : "text-xs"} ${
                        tone === "lime" ? "bg-[#D9F24A]/20 text-[#5a6e0f]" : "bg-zinc-100 text-zinc-700"
                    }`}
                >
                    {s}
                </span>
            ))}
        </div>
    );
}
