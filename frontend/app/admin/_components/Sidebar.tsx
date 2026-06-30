"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BriefcaseBusiness,
  Monitor,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";



const navItems = [
    {
        name: "Users",
        href: "/admin/users",
        icon: User,
    },
    {
      name: "Jobs",
      href: "/admin/jobs",
      icon: BriefcaseBusiness,
    },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {logout} = useAuth(); 

  return (
    <aside className="flex h-screen w-[202px] shrink-0 flex-col border-r border-slate-200/70 bg-white">
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-base font-semibold tracking-tight text-slate-900 suppressHydrationWarning">
          Dakshya AI
        </h1>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${
                  isActive
                    ? "border-l-4 border-slate-900 bg-[#EFEFE8] font-semibold text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200/70 p-4">
        <button 
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
          <LogOut size={16} strokeWidth={1.8} />
          Logout
        </button>
      </div>
    </aside>
  );
}