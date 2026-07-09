import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetSubjectById } from "@/lib/actions/admin/subject-action";
import SubjectFormEdit from "../../_components/SubjectFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetSubjectById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/subject" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to subjects
            </Link>
            
            <SubjectFormEdit subject={result.data} />
        </section>
    );
}
