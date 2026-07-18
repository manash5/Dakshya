"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { handleAnalyzeResume } from "@/lib/actions/resumeAnalysis-action";
import type { ResumeAnalysis } from "@/lib/api/resumeAnalysis";
import ResumeUploadZone from "./ResumeUploadZone";
import ResumeAnalysisResults from "./ResumeAnalysisResults";
import ResumeHistoryStrip from "./ResumeHistoryStrip";

export default function ResumeAnalyzerFlow({
    initialLatest,
    initialHistory,
}: {
    initialLatest: ResumeAnalysis | null;
    initialHistory: ResumeAnalysis[];
}) {
    const [selected, setSelected] = useState<ResumeAnalysis | null>(initialLatest);
    const [history, setHistory] = useState<ResumeAnalysis[]>(initialHistory);
    const [showUpload, setShowUpload] = useState(!initialLatest);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelected = async (file: File) => {
        setAnalyzing(true);
        setError("");

        const formData = new FormData();
        formData.append("resume", file);

        const result = await handleAnalyzeResume(formData);
        setAnalyzing(false);

        if (result.success) {
            setSelected(result.data);
            setHistory((prev) => [result.data, ...prev]);
            setShowUpload(false);
        } else {
            setError(result.message);
        }
    };

    const showResults = selected && !showUpload;

    return (
        <div className="flex flex-col gap-5">
            {history.length > 0 && (
                <ResumeHistoryStrip
                    history={history}
                    selectedId={selected?._id ?? null}
                    onSelect={(analysis) => {
                        setSelected(analysis);
                        setShowUpload(false);
                    }}
                    onUploadNew={() => setShowUpload(true)}
                />
            )}

            <AnimatePresence mode="wait">
                {showResults ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        <ResumeAnalysisResults analysis={selected!} onReanalyze={() => setShowUpload(true)} />
                    </motion.div>
                ) : (
                    <motion.div key="upload">
                        <ResumeUploadZone onFileSelected={handleFileSelected} analyzing={analyzing} error={error} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
