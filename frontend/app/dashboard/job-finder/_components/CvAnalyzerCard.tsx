import Link from "next/link";
import { ScanSearch, UploadCloud } from "lucide-react";
import type { ResumeAnalysis } from "@/lib/api/resumeAnalysis";

interface CvAnalyzerCardProps {
  analysis: ResumeAnalysis | null;
}

export default function CvAnalyzerCard({ analysis }: CvAnalyzerCardProps) {
  return (
    <Link
      href="/dashboard/resume-analysis"
      className="group relative block overflow-hidden rounded-[24px] border border-black/5 bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ScanSearch size={16} />
        </span>
        <h3 className="text-base font-semibold text-zinc-900">CV Analyzer</h3>
      </div>

      {analysis ? (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-primary">{analysis.atsScore}%</p>
            <p className="text-xs text-zinc-400">ATS Score</p>
          </div>
          {analysis.strengths[0] && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Top strength: {analysis.strengths[0]}
            </p>
          )}
          <div className="mt-6 flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-200 bg-surface transition group-hover:border-primary/40">
            <span className="text-xs font-semibold tracking-wide text-primary">
              RE-ANALYZE RESUME
            </span>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Upload your resume for instant AI matching, ATS scoring, and skill gap analysis.
          </p>

          <div className="mt-6 flex h-20 items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 bg-surface transition group-hover:border-primary/40">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition group-hover:scale-105">
              <UploadCloud size={16} />
            </span>
            <span className="text-xs font-semibold tracking-wide text-primary">
              ANALYZE MY RESUME
            </span>
          </div>
        </>
      )}
    </Link>
  );
}
