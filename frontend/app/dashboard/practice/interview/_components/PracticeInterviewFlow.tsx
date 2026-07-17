"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import QuestionPanel, { QuestionAnswerValue } from "./QuestionPanel";
import AttemptResults from "../../_components/AttemptResults";
import { handleCompleteAttempt, handleStartAttempt, handleSubmitAnswer } from "@/lib/actions/practiceAttempt-action";
import type { PracticeAttempt } from "@/lib/api/practiceAttempt";

type Stage = "setup" | "in-progress" | "results";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
const MODES = ["Oral", "Coding", "Mixed"] as const;

const fadeSlide = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -14 },
    transition: { duration: 0.25, ease: "easeOut" as const },
};

interface PracticeInterviewFlowProps {
    jobRoleId: string;
    jobRoleTitle: string;
    skill: string | null;
    skillLabel: string | null;
    skills?: string[] | null;
    initialQuestionCount?: number | null;
}

export default function PracticeInterviewFlow({
    jobRoleId,
    jobRoleTitle,
    skill,
    skillLabel,
    skills,
    initialQuestionCount,
}: PracticeInterviewFlowProps) {
    const [stage, setStage] = useState<Stage>("setup");

    const hasMultiSkill = !!skills && skills.length > 0;
    // Deliberately separate framing from the general (no skill/skills)
    // interview flow: Practice says "let's learn", Interview says "let's
    // evaluate" -- same underlying flow, different mindset/copy.
    const isPureInterview = !skill && !hasMultiSkill;

    const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("Intermediate");
    const [mode, setMode] = useState<(typeof MODES)[number]>("Mixed");
    const [questionCount, setQuestionCount] = useState(initialQuestionCount ?? 5);

    const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState<QuestionAnswerValue>({ userAnswer: "", userCode: "" });
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleStart = async () => {
        setStarting(true);
        setError("");

        const result = await handleStartAttempt({
            jobRoleId,
            skill: hasMultiSkill ? undefined : skill ?? undefined,
            skills: hasMultiSkill ? (skills as string[]) : undefined,
            difficulty,
            mode,
            questionCount,
        });
        setStarting(false);

        if (result.success) {
            setAttempt(result.data);
            setCurrentIndex(0);
            setStage("in-progress");
        } else {
            setError(result.message);
        }
    };

    const question = attempt?.questions[currentIndex] ?? null;
    const isAnswered = question ? question.userAnswer !== "" || question.feedback !== "" : false;
    const isLast = attempt ? currentIndex === attempt.questions.length - 1 : false;
    const canProceed =
        isAnswered ||
        (question?.type === "coding"
            ? currentAnswer.userCode.trim().length > 0
            : currentAnswer.userAnswer.trim().length > 0);

    const handleNext = async () => {
        if (!attempt || !question) return;
        setError("");

        let workingAttempt = attempt;

        if (!isAnswered) {
            setSubmitting(true);
            const result = await handleSubmitAnswer(attempt._id, {
                questionIndex: currentIndex,
                userAnswer: currentAnswer.userAnswer,
                userCode: currentAnswer.userCode,
            });

            if (!result.success) {
                setSubmitting(false);
                setError(result.message);
                return;
            }

            workingAttempt = result.data;
            setAttempt(workingAttempt);
        }

        if (isLast) {
            setSubmitting(true);
            const result = await handleCompleteAttempt(workingAttempt._id);
            setSubmitting(false);

            if (result.success) {
                setAttempt(result.data);
                setStage("results");
            } else {
                setError(result.message);
            }
            return;
        }

        setSubmitting(false);
        setCurrentIndex((i) => i + 1);
    };

    const resetToSetup = () => {
        setAttempt(null);
        setCurrentIndex(0);
        setCurrentAnswer({ userAnswer: "", userCode: "" });
        setStage("setup");
        setError("");
    };

    return (
        <AnimatePresence mode="wait">
            {stage === "setup" && (
                <motion.div key="setup" {...fadeSlide}>
                    <Link
                        href="/dashboard/practice"
                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
                    >
                        <ArrowLeft size={14} /> Back to Practice
                    </Link>

                    <div className="rounded-[24px] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
                        <h2 className="text-2xl font-semibold text-zinc-900">
                            {isPureInterview ? "Start a Mock Interview" : "Start a Practice Session"}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            {hasMultiSkill
                                ? `Practicing: ${skillLabel} for ${jobRoleTitle}.`
                                : skillLabel
                                    ? `Focused on ${skillLabel} for ${jobRoleTitle}.`
                                    : `General interview for ${jobRoleTitle}.`}
                        </p>

                        <div className="mt-6 flex flex-col gap-5">
                            <Field label="Difficulty">
                                <div className="flex flex-wrap gap-2">
                                    {DIFFICULTIES.map((d) => (
                                        <PillOption
                                            key={d}
                                            label={d}
                                            active={difficulty === d}
                                            onClick={() => setDifficulty(d)}
                                        />
                                    ))}
                                </div>
                            </Field>

                            <Field label="Mode">
                                <div className="flex flex-wrap gap-2">
                                    {MODES.map((m) => (
                                        <PillOption key={m} label={m} active={mode === m} onClick={() => setMode(m)} />
                                    ))}
                                </div>
                            </Field>

                            <Field label="Number of questions">
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-28 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors duration-150 focus:border-zinc-900 focus:bg-white"
                                />
                            </Field>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                        <motion.button
                            type="button"
                            onClick={handleStart}
                            disabled={starting}
                            whileTap={{ scale: 0.98 }}
                            className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition-colors duration-150 hover:bg-zinc-800 disabled:opacity-50"
                        >
                            {starting
                                ? "Generating questions…"
                                : isPureInterview
                                    ? "Start Interview"
                                    : "Start Practice"}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {stage === "in-progress" && attempt && question && (
                <motion.div key="in-progress" {...fadeSlide}>
                    <div className="rounded-[24px] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                                Question {currentIndex + 1} of {attempt.questions.length} · {question.type}
                            </p>
                            <p className="text-xs text-zinc-400">
                                {attempt.jobRoleId.title}
                                {attempt.skill ? ` · ${attempt.skill}` : ""}
                                {attempt.skills && attempt.skills.length > 0
                                    ? ` · ${attempt.skills.join(", ")}`
                                    : ""}{" "}
                                · {attempt.difficulty}
                            </p>
                        </div>

                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                            <motion.div
                                className="h-full rounded-full bg-zinc-900"
                                animate={{ width: `${((currentIndex + 1) / attempt.questions.length) * 100}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <h3 className="mt-5 text-lg font-medium text-zinc-900">{question.question}</h3>

                                <div className="mt-6">
                                    {isAnswered ? (
                                        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
                                            <CheckCircle2 size={18} className="shrink-0" />
                                            Answer submitted. Your score and feedback will be in the full analysis
                                            once you finish the interview.
                                        </div>
                                    ) : (
                                        <QuestionPanel
                                            key={currentIndex}
                                            question={question}
                                            onChange={setCurrentAnswer}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-8 flex items-center justify-between">
                            <button
                                type="button"
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex((i) => i - 1)}
                                className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-0"
                            >
                                Back
                            </button>

                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNext}
                                disabled={submitting || !canProceed}
                                className={`flex items-center gap-1 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:opacity-40 ${
                                    isLast
                                        ? "bg-[#D9F24A] text-zinc-900 hover:brightness-95"
                                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                                }`}
                            >
                                {submitting ? (
                                    isLast ? (
                                        "Finishing…"
                                    ) : (
                                        "Evaluating…"
                                    )
                                ) : isLast ? (
                                    isPureInterview ? "Finish Interview" : "Finish Session"
                                ) : (
                                    <>
                                        Next <ChevronRight size={16} />
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {!canProceed && !isAnswered && (
                            <p className="mt-3 text-right text-xs text-zinc-400">
                                {question.type === "coding"
                                    ? "Write a solution before continuing."
                                    : "Type or record an answer before continuing."}
                            </p>
                        )}

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                    </div>
                </motion.div>
            )}

            {stage === "results" && attempt && (
                <motion.div key="results" {...fadeSlide}>
                    <div className="rounded-[24px] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)]">
                        <h2 className="text-2xl font-semibold text-zinc-900">
                            {isPureInterview ? "Interview Results" : "Practice Results"}
                        </h2>

                        <div className="mt-1">
                            <AttemptResults attempt={attempt} />
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={resetToSetup}
                                className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                <RotateCcw size={14} />{" "}
                                {isPureInterview ? "Start Another Interview" : "Start Another Session"}
                            </button>
                            <Link
                                href="/dashboard/practice"
                                className="flex items-center gap-2 rounded-full border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                            >
                                <ArrowLeft size={14} /> Back to Practice
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
            {children}
        </div>
    );
}

function PillOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
        >
            {label}
        </button>
    );
}
