"use client";

import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, LoginFormValues } from './schema';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/actions/auth-action";
import { useAuth } from "@/lib/context/AuthContext";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { googleLoginAction } from "@/lib/actions/auth-action"; // new action, added below




export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const router = useRouter();
    const { checkAuth } = useAuth();
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
        // isPending is true during the transition, 
        // and false after it finishes
        setError('');
        startTransition(
            async () => {
                try {
                    const result = await loginUser(data);
                    if (result.success) {
                        await checkAuth();
                        router.push('/dashboard')
                    } else {
                        setError(result.message || 'Login failed');
                    }
                } catch (error: any) {
                    setError(error?.message || 'Login failed');
                }
            }
        );
    }

    const handleGoogleSuccess = async (credentialResponse: any) => {
        const idToken = credentialResponse.credential;
        if (!idToken) return;

        setError('');
        startTransition(async () => {
            try {
                const result = await googleLoginAction(idToken);
                if (result.success) {
                    await checkAuth();
                    router.push('/dashboard');
                } else {
                    setError(result.message || 'Google login failed');
                }
            } catch (err: any) {
                setError(err?.message || 'Google login failed');
            }
        });
    };

    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError('');
            startTransition(async () => {
                try {
                    const result = await googleLoginAction(tokenResponse.access_token);
                    if (result.success) {
                        await checkAuth();
                        router.push('/dashboard');
                    } else {
                        setError(result.message || 'Google login failed');
                    }
                } catch (err: any) {
                    setError(err?.message || 'Google login failed');
                }
            });
        },
        onError: () => setError('Google login failed'),
    });

    return (
        <div className="relative flex w-full max-w-[480px] flex-col text-neutral-900">
            <div className="space-y-5">
                {error ? (
                    <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {error}
                    </p>
                ) : null}
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

                <div className="flex w-full justify-center [&>div]:w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google login failed')}
                        theme="outline"
                        shape="pill"
                        size="large"
                        width="100%"
                        text="continue_with"
                    />
                </div>
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
