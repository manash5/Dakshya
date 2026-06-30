export default function Footer() {
    return (
        <footer className="flex items-center justify-between  bg-surface-soft px-6 py-4">
            <p className="text-xs tracking-[0.5px] text-muted">
                © {new Date().getFullYear()} My App — Admin
            </p>
            <p className="text-xs tracking-[0.5px] text-muted">EN · Global</p>
        </footer>
    );
}