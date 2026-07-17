interface BrowserWindowFrameProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

// Minimal "app window" chrome (title bar + neutral traffic-light dots) so
// the illustrative dashboard/roadmap panels read clearly as UI screenshots
// rather than ambiguous floating cards.
export default function BrowserWindowFrame({ title, children, className }: BrowserWindowFrameProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-neutral-100 bg-[#FAFBF6] px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
        </span>
        <span className="ml-1 truncate text-[11px] font-medium text-neutral-400">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
