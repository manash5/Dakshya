import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetJobRoleById } from "@/lib/actions/admin/jobRole-action";
import JobFormEdit from "../../_components/JobFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetJobRoleById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/jobs" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to jobs
            </Link>
            
            <JobFormEdit job={result.data} />
        </section>
    );
}
