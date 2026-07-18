import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetOpportunityById } from "@/lib/actions/admin/opportunity-action";
import OpportunityFormEdit from "../../_components/OpportunityFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetOpportunityById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/opportunities" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to opportunities
            </Link>

            <OpportunityFormEdit opportunity={result.data} />
        </section>
    );
}
