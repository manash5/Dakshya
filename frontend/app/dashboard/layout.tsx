import DashboardHeader from "./_components/layout/header";
import Sidebar from "./_components/layout/sidebar";

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section className="h-screen overflow-hidden bg-[#F7F8F5]">
          <div className="flex h-full min-h-0">
            <Sidebar />

            <main className="min-w-0 flex flex-1 flex-col overflow-hidden">
              <div className="shrink-0">
                <DashboardHeader />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {children}
              </div>
            </main>
          </div>
        </section>
    );
}