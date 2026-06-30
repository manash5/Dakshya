import Link from "next/link";

const CARDS = [
    { href: "/admin/users", label: "Users", desc: "Manage accounts, roles and access." },
    { href: "/admin/jobs", label: "Jobs", desc: "Create, edit and publish job posts." },
];

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-5xl">
                <div className="bg-white rounded-2xl shadow-md p-8">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Admin
                    </p>
                    <h2 className="mb-8 text-2xl font-bold text-gray-900">Overview</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {CARDS.map(({ href, label, desc }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group rounded-xl border border-gray-100 bg-gray-50 p-6 transition-colors hover:border-gray-300 hover:bg-white"
                            >
                                <h3 className="mb-1 text-lg font-bold text-gray-900">{label}</h3>
                                <p className="text-sm text-gray-500">{desc}</p>
                                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#5a7a1e] opacity-0 transition-opacity group-hover:opacity-100">
                                    Manage →
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}