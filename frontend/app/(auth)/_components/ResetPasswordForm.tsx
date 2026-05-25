"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { resetPasswordSchema, ResetPasswordValues } from "./schema";
import Image from "next/image";

export default function ResetPasswordForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const inputBaseClasses =
        "mt-2 w-full rounded-xl border border-transparent bg-neutral-50 px-4 py-3 text-sm text-neutral-800 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-200/30";

    const onSubmit = (data: ResetPasswordValues) => {
        void data;
    };

    return (
        <div className="relative flex w-full max-w-[480px] flex-col text-neutral-900">
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <div className="relative h-8 w-28 shrink-0">
                        <Image
                            src="/dakshya_main.png"
                            alt="Dakshya"
                            fill
                            sizes="128px"
                            className="object-cover -trasnlate-x-5"
                            priority
                            loading="eager"
                        />
                    </div>
                    <span className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-700">
                        Reset Password
                    </span>
                </div>

                <div>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900">
                        Set a new password
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500">
                        Your new password must be at least 8 characters.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            New password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter a new password"
                            className={inputBaseClasses}
                            aria-invalid={Boolean(errors.password)}
                            {...register("password")}
                        />
                        {errors.password ? (
                            <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            Confirm new password
                        </label>
                        <input
                            type="password"
                            placeholder="Re-enter your new password"
                            className={inputBaseClasses}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword ? (
                            <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-[#b9e956] to-[#a6e042] px-4 py-3 text-sm font-semibold text-[#0c2422] shadow-[0_10px_20px_rgba(166,224,66,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(166,224,66,0.4)] active:translate-y-0"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Reset password"}
                    </button>
                </form>
            </div>

            <div className="mt-6 text-center text-xs text-neutral-500">
                Remember your password?{" "}
                <a className="font-semibold text-[#7aa321]" href="/login">
                    Sign in
                </a>
            </div>
        </div>
    );
}
