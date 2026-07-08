"use client";

import { ScanSearch, UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";

type CvAnalyzerCardProps = {
  onFileSelected?: (file: File) => void;
};

export default function CvAnalyzerCard({ onFileSelected }: CvAnalyzerCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelected?.(file);
    },
    [onFileSelected],
  );

  return (
    <div className="rounded-[24px] bg-zinc-900 p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.15)]">
      <div className="flex items-center gap-2">
        <ScanSearch size={18} className="text-[#D9F24A]" />
        <h3 className="text-base font-semibold">CV Analyzer</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Drop your resume here for instant AI matching and skill gap analysis.
      </p>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={`mt-6 flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition ${
          isDragActive
            ? "border-[#D9F24A] bg-[#D9F24A]/5"
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelected?.(file);
          }}
        />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D9F24A] text-zinc-900">
          <UploadCloud size={18} />
        </span>
        <span className="text-xs font-semibold tracking-wide text-[#D9F24A]">
          DRAG & DROP PDF
        </span>
      </label>
    </div>
  );
}
