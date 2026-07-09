import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetUniversityById } from "@/lib/actions/admin/university-action";
import UniversityFormEdit from "../../_components/UniversityFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetUniversityById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/university" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to universities
            </Link>
            
            <UniversityFormEdit university={result.data} />
        </section>
    );
}
