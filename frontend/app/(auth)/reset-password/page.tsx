"use client";

import { motion } from "framer-motion";
import ForgotPasswordForm from '../_components/ForgotPasswordForm'
import Image from 'next/image';
import ResetPasswordForm from "../_components/ResetPasswordForm";


export default function Page() {
    const inputBaseClasses =
        "mt-2 w-full rounded-xl border border-transparent bg-neutral-50 px-4 py-3 text-sm text-neutral-800 outline-none transition duration-200 placeholder:text-neutral-400 focus:border-lime-300 focus:bg-white focus:ring-4 focus:ring-lime-200/30";

    return (
        <main className="min-h-screen w-full bg-white px-6 py-8 text-neutral-900">
            <div className="mainCard mx-auto flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
                <div className="relative h-[850px] min-h-[850px] w-full max-w-[1400px] overflow-hidden rounded-[28px] bg-[#0c2422] shadow-[0_28px_75px_rgba(36,16,58,0.22)] max-lg:h-auto max-lg:min-h-0">
                    <div className="relative z-10 grid h-full grid-cols-[35%_65%] max-lg:grid-cols-1">
                        <section className="leftSide relative z-20 h-full overflow-visible px-10 py-10 text-white max-lg:h-auto max-lg:overflow-hidden">
                            <img
                                src="/Theme.jpg"
                                alt=""
                                className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 -rotate-90 scale-[2.05] object-contain"
                                aria-hidden="true"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,233,86,0.18),transparent_55%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(86,129,98,0.35),transparent_50%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(20,40,36,0.6),transparent_55%)]" />
                            <div className="absolute -left-16 top-16 h-48 w-48 rounded-full bg-lime-300/10 blur-[70px]" />
                            <div className="absolute right-10 top-1/2 h-40 w-40 rounded-full bg-emerald-200/10 blur-[65px]" />
                            <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%2760%27 height=%2760%27 filter=%27url(%23n)%27 opacity=%270.2%27/%3E%3C/svg%3E')]
                            " />
                            <div className="absolute left-16 top-24 h-2 w-2 rounded-full bg-white/30" aria-hidden="true" />
                            <div className="absolute right-24 top-32 h-1.5 w-1.5 rounded-full bg-white/20" aria-hidden="true" />
                            <div className="absolute left-24 bottom-28 h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden="true" />
                            <div className="relative z-10 flex h-full flex-col justify-between -translate-y-6 max-lg:gap-10 max-lg:translate-y-0">
                                <div className="max-w-sm">
                                    <div className="flex items-center gap-2 py-10">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40">
                                            <span className="block h-4 w-4 rounded-full border border-white/70" />
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                                        Reset your <span className="text-[#b9e956]">momentum</span>
                                    </h2>
                                    <p className="mt-4 max-w-xs text-sm text-white/70">
                                        We will send you a secure link to get back into your account.
                                    </p>
                                </div>
                                 <Image
                                        src="/forgot-password.png"
                                        alt="3D illustration"
                                        width={860}
                                        height={520}
                                        className="pointer-events-none absolute left-15 bottom-0 z-30 h-[620px] w-[860px] scale-[1.38] translate-x-[5%] object-contain drop-shadow-[0_26px_40px_rgba(0,0,0,0.3)] max-lg:static max-lg:mx-auto max-lg:h-[340px] max-lg:w-[340px] max-lg:scale-100 max-lg:translate-x-0"
                                    />
                            </div>
                        </section>

                        <section className="rightSide relative z-10 flex h-full items-center justify-center max-lg:px-6 max-lg:py-12">
                            <motion.div
                                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] bg-white px-12 py-8 shadow-[0_18px_45px_rgba(36,16,58,0.16)] max-lg:h-auto max-lg:px-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <ResetPasswordForm/>
                            </motion.div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}