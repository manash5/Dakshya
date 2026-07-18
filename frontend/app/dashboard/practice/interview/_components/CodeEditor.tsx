"use client";

import dynamic from "next/dynamic";

// Monaco needs `window`, so it's dynamically imported with ssr disabled --
// see the Next.js lazy-loading guide (`next/dynamic` + `{ ssr: false }` is
// only valid inside a Client Component, which this file already is).
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
            Loading editor…
        </div>
    ),
});

export default function CodeEditor({
    value,
    onChange,
    language = "javascript",
}: {
    value: string;
    onChange: (value: string) => void;
    language?: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 transition-colors duration-150 focus-within:border-zinc-900">
            {/* Monaco has no native placeholder prop -- this fake overlay
                fills that gap without pre-seeding real editor content (a
                pre-filled comment would trivially satisfy "must write
                something" validation before the candidate types anything). */}
            {value === "" && (
                <div className="pointer-events-none absolute left-[52px] top-[13px] z-10 select-none font-mono text-sm text-zinc-500">
                    // Write your solution here
                </div>
            )}
            <MonacoEditor
                height="320px"
                language={language}
                value={value}
                onChange={(val) => onChange(val ?? "")}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                }}
            />
        </div>
    );
}
