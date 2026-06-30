import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-canvas text-body">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
                <Footer />
            </div>
        </div>
    );
}