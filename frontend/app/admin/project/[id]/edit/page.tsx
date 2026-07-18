import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetProjectById } from "@/lib/actions/project-action";
import { getJobRoles } from "@/lib/actions/onboarding-action";
import ProjectFormEdit from "../../_components/ProjectFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [result, jobRoles] = await Promise.all([
        handleGetProjectById(id),
        getJobRoles(),
    ]);

    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/project" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to projects
            </Link>

            <ProjectFormEdit project={result.data} jobRoles={jobRoles} />
        </section>
    );
}
