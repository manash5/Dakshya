import Link from "next/link";
import { ScanSearch, UploadCloud } from "lucide-react";

export default function CvAnalyzerCard() {
  return (
    <Link
      href="/dashboard/resume-analysis"
      className="group relative block overflow-hidden rounded-[24px] bg-zinc-900 p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.15)] transition hover:shadow-[0_24px_48px_rgba(15,23,42,0.22)]"
    >
      <div className="flex items-center gap-2">
        <ScanSearch size={18} className="text-[#D9F24A]" />
        <h3 className="text-base font-semibold">CV Analyzer</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Upload your resume for instant AI matching, ATS scoring, and skill gap analysis.
      </p>

      <div className="mt-6 flex h-20 items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 transition group-hover:border-[#D9F24A]/60">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9F24A] text-zinc-900 transition group-hover:scale-105">
          <UploadCloud size={16} />
        </span>
        <span className="text-xs font-semibold tracking-wide text-[#D9F24A]">ANALYZE MY RESUME</span>
      </div>
    </Link>
  );
}
