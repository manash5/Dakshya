"use client";

import { formatRelativeDate } from "./profile-types";

export default function ProfileFooter({ updatedAt }: { updatedAt?: string }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-500">
            <p>Last profile update: {formatRelativeDate(updatedAt)}</p>
            <div className="flex items-center gap-4">
                <button type="button" className="transition hover:text-slate-800">Privacy Policy</button>
                <button type="button" className="transition hover:text-slate-800">Terms of Service</button>
            </div>
        </div>
    );
}
