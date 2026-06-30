import Link from "next/link";
import { notFound } from "next/navigation";
import { handleGetUserById } from "@/lib/actions/admin/user-action";
import UserFormEdit from "../../_components/UserFormEdit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await handleGetUserById(id);
    if (!result.success || !result.data) notFound();

    return (
        <section>
            <Link href="/admin/users" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to users
            </Link>
            
            <UserFormEdit user={result.data} />
        </section>
    );
}