import type { PracticeAttempt } from "@/lib/api/practiceAttempt";

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

function ResultScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl bg-[#F7F8F5] p-5 text-center">
      <p className="text-3xl font-bold text-zinc-900">{value ?? "—"}</p>
      <p className="mt-1 text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3 text-center">
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

interface AttemptResultsProps {
  attempt: PracticeAttempt;
}

export default function AttemptResults({ attempt }: AttemptResultsProps) {
  return (
    <div>
      <p className="text-sm text-zinc-500">
        {attempt.jobRoleId.title}
        {attempt.skill ? ` · ${attempt.skill}` : ""} · {attempt.difficulty} · {attempt.mode}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <ResultScore label="Overall" value={attempt.overallScore} />
        <ResultScore label="Technical" value={attempt.technicalScore} />
        <ResultScore label="Communication" value={attempt.communicationScore} />
      </div>

      <p className="mt-4 text-xs text-zinc-400">Duration: {formatDuration(attempt.duration)}</p>

      <div className="mt-8 flex flex-col gap-4">
        {attempt.questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Question {i + 1} · {q.type}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{q.question}</p>

            {q.type === "coding" && q.userCode && (
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
                {q.userCode}
              </pre>
            )}
            <div className="mt-3">
              <p className="text-xs font-medium text-zinc-500">
                {q.type === "coding" ? "Explanation given" : "Your answer"}
              </p>
              <p className="mt-1 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                {q.userAnswer || "(none given)"}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <ScoreBadge label="Technical" value={q.score} />
              <ScoreBadge label="Confidence" value={q.confidenceScore} />
            </div>

            <div className="mt-3 rounded-lg bg-[#F7F8F5] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Feedback
              </p>
              <p className="mt-1 text-sm text-zinc-700">{q.feedback}</p>
            </div>

            {q.expectedAnswer && (
              <details className="mt-3 rounded-lg border border-zinc-200 p-3 text-sm">
                <summary className="cursor-pointer font-medium text-zinc-700">
                  Show ideal answer
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-zinc-600">{q.expectedAnswer}</p>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
