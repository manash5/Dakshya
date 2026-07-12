import Link from "next/link";
import UniversityForm from "../_components/UniversityForm";

export default function Page() {
    return (
        <section>
            <Link href="/admin/university" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to universities
            </Link>
            <UniversityForm />
        </section>
    );
}
