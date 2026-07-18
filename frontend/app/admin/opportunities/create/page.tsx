import Link from "next/link";
import OpportunityForm from "../_components/OpportunityForm";

export default function Page() {
    return (
        <section>
            <Link href="/admin/opportunities" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to opportunities
            </Link>
            <OpportunityForm />
        </section>
    );
}
