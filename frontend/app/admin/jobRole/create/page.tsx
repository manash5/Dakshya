import Link from "next/link";
import JobForm from "../_components/JobForm";

export default function Page() {
    return (
        <section>
            <Link href="/admin/jobRole" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to jobs
            </Link>
            <JobForm />
        </section>
    );
}
