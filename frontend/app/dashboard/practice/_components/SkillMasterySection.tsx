import { Braces, Database, TerminalSquare } from "lucide-react";

type SkillModule = {
  id: string;
  label: string;
  icon: React.ReactNode;
  mastery: number;
  active?: boolean;
};

const SKILL_MODULES: SkillModule[] = [
  {
    id: "react",
    label: "React.js",
    icon: <TerminalSquare size={16} />,
    mastery: 82,
    active: true,
  },
  {
    id: "node",
    label: "Node.js",
    icon: <span className="text-[10px] font-bold tracking-wide">JS</span>,
    mastery: 64,
  },
  {
    id: "python",
    label: "Python",
    icon: <Braces size={16} />,
    mastery: 41,
  },
  {
    id: "sql",
    label: "SQL",
    icon: <Database size={16} />,
    mastery: 12,
  },
];

export default function SkillMasterySection() {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {SKILL_MODULES.map((skill) => (
        <button
          key={skill.id}
          type="button"
          className={`relative overflow-hidden rounded-[20px] border bg-white p-5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:border-zinc-300 ${
            skill.active ? "border-zinc-900" : "border-zinc-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600">
              {skill.icon}
            </span>
            {skill.active && (
              <span className="rounded-full bg-[#D9F24A] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-zinc-900">
                ACTIVE
              </span>
            )}
          </div>

          <p className="mt-6 text-base font-semibold text-zinc-900">
            {skill.label}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            {skill.mastery}% Mastery
          </p>

          {skill.active && (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-[#D9F24A]" />
          )}
        </button>
      ))}
    </section>
  );
}