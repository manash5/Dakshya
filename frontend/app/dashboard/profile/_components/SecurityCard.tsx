"use client";

import { Shield } from "lucide-react";

import PasswordChangeForm from "./PasswordChangeForm";

export default function SecurityCard() {
    return (
        <section className="rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                    <Shield size={15} strokeWidth={1.9} />
                </div>
                <h2 className="text-base font-semibold tracking-tight text-slate-900">Security</h2>
            </div>

            <PasswordChangeForm />
        </section>
    );
}
