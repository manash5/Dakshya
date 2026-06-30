import { notFound } from "next/navigation";

// Catch-all under /admin: unmatched routes skip segment not-found, so we
// match them here and throw notFound() to render app/admin/not-found.tsx
// inside the admin shell (sidebar/header/footer).
export default function Page() {
    notFound();
}