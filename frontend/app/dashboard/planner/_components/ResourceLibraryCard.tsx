interface Resource {
  id: string;
  tag: string;
  title: string;
}

const RESOURCES: Resource[] = [
  {
    id: "salary-report",
    tag: "ARTICLE",
    title: "The 2024 Product Design Salary Report",
  },
  {
    id: "framer-course",
    tag: "COURSE",
    title: "Advanced Motion with Framer",
  },
];

export default function ResourceLibraryCard() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-5 text-xs font-medium tracking-wide text-neutral-400">
        RESOURCE LIBRARY
      </p>

      <div className="flex flex-col gap-5">
        {RESOURCES.map((resource) => (
          <div key={resource.id}>
            <p className="text-xs font-semibold tracking-wide text-[#7FB519]">
              {resource.tag}
            </p>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-neutral-900">
              {resource.title}
            </p>
          </div>
        ))}
      </div>

      <button className="mt-2 w-full pt-4 text-center text-sm font-medium text-neutral-400 hover:text-neutral-500">
        VIEW ALL RESOURCES
      </button>
    </div>
  );
}