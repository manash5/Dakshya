import Link from "next/link";
import ProjectForm from "../_components/ProjectForm";
import { getJobRoles } from "@/lib/actions/onboarding-action";

export default async function Page() {
    const jobRoles = await getJobRoles();

    return (
        <section>
            <Link href="/admin/project" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to projects
            </Link>
            <ProjectForm jobRoles={jobRoles} />
        </section>
    );
}
