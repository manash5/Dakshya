"use client";

import { Check } from "lucide-react";
import { useState } from "react";

type Goal = {
  id: string;
  label: string;
  done: boolean;
};

const INITIAL_GOALS: Goal[] = [
  { id: "1", label: "LeetCode Practice", done: true },
  { id: "2", label: "Node API Design", done: true },
  { id: "3", label: "Project Arch Review", done: false },
];

export default function DailyGoalsCard() {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const doneCount = goals.filter((g) => g.done).length;

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    );
  };

  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">Daily Goals</h3>
        <span className="rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
          {doneCount}/{goals.length} DONE
        </span>
      </div>

      <ul className="mt-5 flex flex-col gap-4">
        {goals.map((goal) => (
          <li key={goal.id}>
            <button
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  goal.done
                    ? "border-[#D9F24A] bg-[#D9F24A] text-zinc-900"
                    : "border-zinc-300 bg-white"
                }`}
              >
                {goal.done && <Check size={12} strokeWidth={3} />}
              </span>
              <span
                className={`text-sm font-medium ${
                  goal.done ? "text-zinc-400 line-through" : "text-zinc-900"
                }`}
              >
                {goal.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}