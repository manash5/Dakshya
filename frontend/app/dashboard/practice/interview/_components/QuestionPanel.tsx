"use client";

import { useEffect, useState } from "react";
import CodeEditor from "./CodeEditor";
import VoiceRecorder from "./VoiceRecorder";
import type { PracticeQuestion } from "@/lib/api/practiceAttempt";

export interface QuestionAnswerValue {
    userAnswer: string;
    userCode: string;
}

// Purely a controlled input for the CURRENT (unanswered) question -- no
// submit button and no score/feedback display live here anymore. The parent
// (PracticeInterviewFlow) owns submission, validation, and navigation, and
// remounts this component (via `key={questionIndex}`) whenever the question
// changes so its local draft state always starts fresh.
export default function QuestionPanel({
    question,
    onChange,
}: {
    question: PracticeQuestion;
    onChange: (value: QuestionAnswerValue) => void;
}) {
    const isCoding = question.type === "coding";

    const [explanation, setExplanation] = useState("");
    // Genuinely empty, not a pre-filled placeholder comment -- a non-empty
    // default would trivially satisfy the "must write something" validation
    // in the parent without the candidate having typed any real code.
    const [code, setCode] = useState("");

    useEffect(() => {
        onChange({ userAnswer: explanation, userCode: isCoding ? code : "" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [explanation, code]);

    return (
        <div className="flex flex-col gap-4">
            {isCoding && (
                <div>
                    <p className="mb-2 text-xs font-medium text-zinc-500">Your solution</p>
                    <CodeEditor value={code} onChange={setCode} />
                </div>
            )}

            <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">
                    {isCoding ? "Talk through your approach (optional)" : "Your answer"}
                </p>
                <VoiceRecorder
                    onTranscribed={(text) =>
                        setExplanation((prev) => (prev ? `${prev} ${text}` : text))
                    }
                />
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    rows={isCoding ? 3 : 6}
                    placeholder="Type or record your answer…"
                    className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-900 outline-none transition-colors duration-150 focus:border-zinc-900 focus:bg-white"
                />
            </div>
        </div>
    );
}
