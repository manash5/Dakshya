import { ArrowRight, CircuitBoard, LineChart, MessageSquare } from "lucide-react";

type Difficulty = "HARD" | "MEDIUM";

type Project = {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  icon: React.ReactNode;
  gradient: string;
};

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Real-time Chat Engine",
    difficulty: "HARD",
    tags: ["Socket.io", "Redis"],
    icon: <MessageSquare size={40} className="text-sky-400/70" />,
    gradient: "from-zinc-950 via-zinc-900 to-sky-950",
  },
  {
    id: "2",
    title: "Finance Insights",
    difficulty: "MEDIUM",
    tags: ["React Query", "D3.js"],
    icon: <LineChart size={40} className="text-cyan-300/70" />,
    gradient: "from-zinc-950 via-zinc-900 to-cyan-950",
  },
  {
    id: "3",
    title: "Microservices Orchestrator",
    difficulty: "HARD",
    tags: ["Docker", "gRPC"],
    icon: <CircuitBoard size={40} className="text-teal-300/70" />,
    gradient: "from-zinc-950 via-teal-950 to-zinc-900",
  },
];

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  HARD: "bg-red-500 text-white",
  MEDIUM: "bg-[#D9F24A] text-zinc-900",
};

export default function ProjectLearningSection() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Project-Based Learning
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-semibold text-zinc-900 transition hover:text-zinc-600"
        >
          Browse All
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <article
            key={project.id}
            className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <div
              className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${project.gradient}`}
            >
              <span
                className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${DIFFICULTY_STYLES[project.difficulty]}`}
              >
                {project.difficulty}
              </span>
              {project.icon}
            </div>

            <div className="p-5">
              <h3 className="text-base font-semibold text-zinc-900">
                {project.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="mt-5 flex items-center gap-1 text-sm font-semibold text-zinc-900 transition hover:text-zinc-600"
              >
                Start Project
                <ArrowRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}