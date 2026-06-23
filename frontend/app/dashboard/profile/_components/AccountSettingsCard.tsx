"use client";

import { Mail, UserRound } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { UpdateUserData } from "./profile-form";

export default function AccountSettingsCard() {
    const {
        register,
        formState: { errors },
    } = useFormContext<UpdateUserData>();

    return (
        <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">Account Settings</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage your public and private information</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                    <UserRound size={18} strokeWidth={1.9} />
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="firstName" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Full Name
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <input
                                id="firstName"
                                type="text"
                                placeholder="First name"
                                aria-invalid={Boolean(errors.firstName)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-100"
                                {...register("firstName")}
                            />
                            {errors.firstName ? <p className="mt-2 text-xs text-rose-500">{errors.firstName.message}</p> : null}
                        </div>

                        <div>
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Last name"
                                aria-invalid={Boolean(errors.lastName)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-100"
                                {...register("lastName")}
                            />
                            {errors.lastName ? <p className="mt-2 text-xs text-rose-500">{errors.lastName.message}</p> : null}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            aria-invalid={Boolean(errors.email)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-100"
                            {...register("email")}
                        />
                    </div>
                    {errors.email ? <p className="text-xs text-rose-500">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Username
                    </label>
                    <div className="relative">
                        <UserRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="username"
                            type="text"
                            placeholder="choose-a-username"
                            aria-invalid={Boolean(errors.username)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-100"
                            {...register("username")}
                        />
                    </div>
                    {errors.username ? <p className="text-xs text-rose-500">{errors.username.message}</p> : null}
                </div>

                <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Phone Number
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                            +
                        </span>
                        <input
                            id="phoneNumber"
                            type="tel"
                            placeholder="977 9841234567"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-100"
                            {...register("phoneNumber")}
                        />
                    </div>
                    {errors.phoneNumber ? <p className="text-xs text-rose-500">{errors.phoneNumber.message}</p> : null}
                </div>

            </div>
        </section>
    );
}