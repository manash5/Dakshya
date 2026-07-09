import Link from "next/link";
import SubjectForm from "../_components/SubjectForm";

export default function Page() {
    return (
        <section>
            <Link href="/admin/subject" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to subjects
            </Link>
            <SubjectForm />
        </section>
    );
}
