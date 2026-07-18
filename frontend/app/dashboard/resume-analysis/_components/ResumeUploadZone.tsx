"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, UploadCloud } from "lucide-react";

export default function ResumeUploadZone({
    onFileSelected,
    analyzing,
    error,
}: {
    onFileSelected: (file: File) => void;
    analyzing: boolean;
    error: string;
}) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFile = useCallback(
        (file: File | undefined) => {
            if (!file) return;
            setFileName(file.name);
            onFileSelected(file);
        },
        [onFileSelected],
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-[24px] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)]"
        >
            <h2 className="text-2xl font-semibold text-zinc-900">Resume Analyzer</h2>
            <p className="mt-1 text-sm text-zinc-500">
                Upload your resume as a PDF for AI-powered feedback, ATS scoring, and skill-gap analysis.
            </p>

            <label
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!analyzing) setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    if (analyzing) return;
                    handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`mt-6 flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors duration-200 ${
                    analyzing
                        ? "cursor-not-allowed border-zinc-200 bg-zinc-50"
                        : isDragActive
                          ? "cursor-pointer border-zinc-900 bg-zinc-50"
                          : "cursor-pointer border-zinc-200 bg-zinc-50/60 hover:border-zinc-400"
                }`}
            >
                <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    disabled={analyzing}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {analyzing ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3"
                    >
                        <Loader2 size={28} className="animate-spin text-zinc-400" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-700">Analyzing {fileName || "your resume"}…</p>
                            <p className="mt-1 text-xs text-zinc-400">
                                Extracting skills, scoring ATS compatibility, checking identity match
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-[#D9F24A]">
                            {fileName ? <FileText size={20} /> : <UploadCloud size={20} />}
                        </span>
                        <span className="text-sm font-semibold text-zinc-700">
                            {fileName || "Drag & drop your resume, or click to browse"}
                        </span>
                        <span className="text-xs text-zinc-400">PDF only, up to 5MB</span>
                    </>
                )}
            </label>

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600"
                >
                    {error}
                </motion.p>
            )}
        </motion.div>
    );
}
