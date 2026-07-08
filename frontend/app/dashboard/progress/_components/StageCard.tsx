export type StageVariant = "completed" | "in-progress" | "locked";

interface StageCardProps {
  variant: StageVariant;
  eyebrow: string;
  statusLabel: string;
  title: string;
  subtitle: string;
  progress?: number;
  tags?: string[];
  actionLabel: string;
  lockedNote?: string;
}

export default function StageCard({
  variant,
  eyebrow,
  statusLabel,
  title,
  subtitle,
  progress,
  tags,
  actionLabel,
  lockedNote,
}: StageCardProps) {
  const isLocked = variant === "locked";

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400">{eyebrow}</span>
          <span
            className={[
              "text-[11px] font-semibold tracking-[0.14em]",
              variant === "completed" && "text-lime-600",
              variant === "in-progress" && "text-lime-600",
              variant === "locked" && "text-zinc-400",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {statusLabel}
          </span>
        </div>

        <button
          type="button"
          disabled={isLocked}
          className={[
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            variant === "completed" && "border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300",
            variant === "in-progress" && "bg-lime-300 text-zinc-900 hover:bg-lime-400",
            isLocked && "cursor-not-allowed bg-zinc-100 text-zinc-400",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {actionLabel}
        </button>
      </div>

      <h3 className={["mt-4 text-xl font-bold", isLocked ? "text-zinc-400" : "text-zinc-900"].join(" ")}>{title}</h3>
      <p className={["mt-1 text-[15px]", isLocked ? "text-zinc-400" : "text-zinc-500"].join(" ")}>
        {subtitle}
      </p>

      {typeof progress === "number" && (
        <div className="mt-5 flex items-center gap-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={["h-full rounded-full", variant === "completed" ? "bg-zinc-900" : "bg-lime-400"].join(" ")}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-sm font-semibold text-zinc-700">{progress}%</span>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {lockedNote && <p className="mt-4 text-sm italic text-zinc-400">{lockedNote}</p>}
    </div>
  );
}