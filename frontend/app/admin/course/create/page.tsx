import Link from "next/link";
import CourseForm from "../_components/CourseForm";

export default function Page() {
    return (
        <section>
            <Link href="/admin/course" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to courses
            </Link>
            <CourseForm />
        </section>
    );
}
