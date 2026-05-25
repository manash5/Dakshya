"use client";

import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, LoginFormValues } from './schema';
import Image from 'next/image';




export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const inputBaseClasses =
        "mt-2 w-full rounded-xl border border-transparent bg-neutral-50 px-4 py-3 text-sm text-neutral-800 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-200/30";

    const onSubmit = (data: LoginFormValues) => {
        void data;
    };

    const handleGoogleSignIn = () => {
        alert("feature not added yet")
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
                        Start free
                    </span>
                </div>

                <div>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900">
                        Sign in
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500">
                        Continue where you left off and keep your roadmap moving.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className={inputBaseClasses}
                            aria-invalid={Boolean(errors.email)}
                            {...register("email")}
                        />
                        {errors.email ? (
                            <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                            Password
                        </label>
                        <div className="mt-2 flex items-center rounded-xl border border-transparent bg-neutral-50 px-4 py-3 text-sm text-neutral-700 transition duration-200 focus-within:border-lime-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-lime-200/30">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="w-full bg-transparent outline-none"
                                aria-invalid={Boolean(errors.password)}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="ml-3 text-neutral-400 transition hover:text-neutral-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password ? (
                            <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                        <label className="flex items-center gap-3">
                            <span className="relative inline-flex h-4 w-4 items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                />
                                <span className="h-4 w-4 rounded-[6px] border border-neutral-300 bg-white transition duration-200 peer-checked:border-lime-400 peer-checked:bg-lime-400" />
                                <span className="absolute h-2 w-2 scale-0 rounded-[3px] bg-[#0c2422] transition duration-200 peer-checked:scale-100" />
                            </span>
                            Remember me
                        </label>
                        <Link className="font-semibold text-[#7aa321]" href="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-[#b9e956] to-[#a6e042] px-4 py-3 text-sm font-semibold text-[#0c2422] shadow-[0_10px_20px_rgba(166,224,66,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(166,224,66,0.4)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>

            <div className="mt-6 space-y-4">
                <div className="space-y-2 text-[11px] text-neutral-400">
                    <span className="font-semibold uppercase tracking-[0.2em] flex justify-center">Or continue with</span>

                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-[0_10px_20px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="M23.5 12.3c0-.8-.1-1.6-.3-2.3H12v4.4h6.4a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 24c3.3 0 6-1.1 8-3l-3.9-3c-1.1.7-2.5 1.1-4.1 1.1-3.2 0-5.9-2.1-6.9-5.1H1.1v3.2C3.1 21.2 7.2 24 12 24z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.1 14c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.2H1.1A12 12 0 0 0 0 11.7c0 2 .5 3.9 1.4 5.6L5.1 14z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 4.7c1.8 0 3.4.6 4.6 1.8l3.4-3.4C18 1.2 15.3 0 12 0 7.2 0 3.1 2.8 1.1 6.9l4 3.1c1-3 3.7-5.3 6.9-5.3z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>
            </div>

            <div className="mt-3 text-center text-xs text-neutral-500">
                New to Dakshya?{" "}
                <Link className="font-semibold text-[#7aa321]" href="/signup">
                    Create an account
                </Link>
            </div>
        </div>
    );
}
