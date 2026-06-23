"use client";

import { useState } from "react";
import { LockKeyhole, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { changePassword } from "@/lib/api/auth";

type Status = "idle" | "loading" | "success" | "error";

export default function PasswordChangeForm() {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const reset = () => {
        setCurrentPassword("");
        setNewPassword("");
        setStatus("idle");
        setErrorMsg("");
    };

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword) return;
        if (newPassword.length < 8) {
            setErrorMsg("New password must be at least 8 characters.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setErrorMsg("");

        try {
            await changePassword({ currentPassword, newPassword });
            setStatus("success");
            setTimeout(() => {
                setOpen(false);
                reset();
            }, 1800);
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "Password change failed.");
        }
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
                <LockKeyhole size={16} strokeWidth={1.9} />
                Change Password
            </button>
        );
    }

    return (
        <div className="mt-5 space-y-3">
            {status === "success" ? (
                <div className="flex items-center gap-2 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-700">
                    <CheckCircle2 size={16} />
                    Password updated!
                </div>
            ) : (
                <>
                    <PasswordField
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        show={showCurrent}
                        onToggleShow={() => setShowCurrent((v) => !v)}
                        disabled={status === "loading"}
                    />
                    <PasswordField
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        show={showNew}
                        onToggleShow={() => setShowNew((v) => !v)}
                        disabled={status === "loading"}
                    />

                    {status === "error" && (
                        <p className="px-1 text-xs text-red-500">{errorMsg}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={status === "loading" || !currentPassword || !newPassword}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                        >
                            {status === "loading" && <Loader2 size={13} className="animate-spin" />}
                            Update
                        </button>
                        <button
                            type="button"
                            onClick={() => { setOpen(false); reset(); }}
                            disabled={status === "loading"}
                            className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// — sub-component kept in same file (small, tightly coupled)
function PasswordField({
    label,
    value,
    onChange,
    show,
    onToggleShow,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggleShow: () => void;
    disabled: boolean;
}) {
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                placeholder={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
                type="button"
                onClick={onToggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}