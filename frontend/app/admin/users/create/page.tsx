import Link from "next/link";
import UserForm from "../_components/UserForm";

export default function Page() {
    return (
        <section>
            <Link href="/admin/users" className="text-xs uppercase tracking-[1.5px] text-muted hover:text-on-dark">
                ← Back to users
            </Link>
            <UserForm />
        </section>
    );
}