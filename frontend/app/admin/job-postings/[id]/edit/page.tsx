import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetJobPostingById } from "@/lib/actions/admin/jobPosting-action";
import JobPostingFormEdit from "../../_components/JobPostingFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetJobPostingById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/job-postings" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to job postings
            </Link>

            <JobPostingFormEdit job={result.data} />
        </section>
    );
}
