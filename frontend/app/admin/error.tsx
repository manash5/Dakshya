"use client";
import { useEffect } from "react";
import StatusScreen from "./_components/StatusScreen";

// This Next.js passes `unstable_retry`, not `reset`.
export default function Error({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <StatusScreen
            title="Something went wrong"
            description={error.message || "An unexpected error occurred while loading this section."}
        >
            <button
                onClick={() => unstable_retry()}
                className="flex h-10 items-center bg-on-dark px-4 text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90"
            >
                Try again
            </button>
        </StatusScreen>
    );
}