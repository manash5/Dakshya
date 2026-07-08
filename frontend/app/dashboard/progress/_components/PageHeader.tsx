import RoleTabs from "./RoleTabs";

interface PageHeaderProps {
  userName: string;
}

export default function PageHeader({ userName }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Flutter Developer Roadmap</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-zinc-500">
          Good morning, {userName}. Here&apos;s your career-focused architectural roadmap for the modern mobile
          landscape.
        </p>
      </div>

      <RoleTabs />
    </div>
  );
}