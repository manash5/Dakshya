"use client";

import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";
import { Camera, Sparkles, UserRound } from "lucide-react";
import type { RefObject } from "react";

import type { UpdateUserData } from "./profile-form";

type ProfileHeaderProps = {
    displayName: string;
    subtitle: string;
    profileScore: number;
    avatarSrc: string | null;
    previewImage: string | null;
    userRole?: string;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onImageChange: (file: File | undefined, onChange: (file: File | undefined) => void) => void;
    onDismissImage: (onChange?: (file: File | undefined) => void) => void;
    isSubmitting: boolean;
};

export default function ProfileHeader({
    displayName,
    subtitle,
    profileScore,
    avatarSrc,
    previewImage,
    userRole,
    fileInputRef,
    onImageChange,
    onDismissImage,
    isSubmitting,
}: ProfileHeaderProps) {
    const { control } = useFormContext<UpdateUserData>();

    return (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
                <div className="relative h-20 w-20 shrink-0 overflow-visible rounded-full sm:h-24 sm:w-24">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-lime-200 via-white to-slate-200 p-1 shadow-[0_16px_30px_rgba(15,23,42,0.14)]">
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-100">
                            {avatarSrc ? (
                                <Image
                                    src={avatarSrc}
                                    alt="Profile avatar"
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-2xl font-semibold text-white">
                                    {(displayName || "P").slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <Controller
                        name="image"
                        control={control}
                        render={({ field: { onChange } }) => (
                            <>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-white shadow-[0_10px_18px_rgba(15,23,42,0.2)] transition hover:scale-105 hover:bg-slate-800"
                                    aria-label="Upload profile photo"
                                >
                                    <Camera size={16} strokeWidth={2} />
                                </button>

                                {previewImage ? (
                                    <button
                                        type="button"
                                        onClick={() => onDismissImage(onChange)}
                                        className="absolute -left-1 -top-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
                                        aria-label="Remove selected profile photo"
                                    >
                                        <span className="text-[11px] leading-none">×</span>
                                    </button>
                                ) : null}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(event) => onImageChange(event.target.files?.[0], onChange)}
                                    accept=".jpg,.jpeg,.png,.webp"
                                    className="hidden"
                                />
                            </>
                        )}
                    />
                </div>

                <div className="pt-1 sm:pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">{displayName}</h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-800">
                            <Sparkles size={12} />
                            Pro member
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500 sm:text-[15px]">{subtitle || "Profile overview"}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-800">
                            <Sparkles size={12} />
                            Profile score {profileScore}%
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                            <UserRound size={12} />
                            {userRole || "user"}
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[#b9e956] px-6 py-3 text-sm font-semibold text-[#0f2417] shadow-[0_14px_30px_rgba(185,233,86,0.38)] transition hover:-translate-y-0.5 hover:bg-[#afe44a] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
        </div>
    );
}