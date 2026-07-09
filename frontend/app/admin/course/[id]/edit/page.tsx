import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetCourseById } from "@/lib/actions/admin/course-action";
import CourseFormEdit from "../../_components/CourseFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetCourseById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/course" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to courses
            </Link>
            
            <CourseFormEdit course={result.data} />
        </section>
    );
}
