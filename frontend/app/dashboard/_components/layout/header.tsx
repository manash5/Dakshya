"use client"

import { useState } from "react";
import { Bell } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";

export default function DashboardHeader() {
  const { user, loading } = useAuth();
  const [imgError, setImgError] = useState(false);

  // Show a skeleton while AuthContext resolves the session cookie
  if (loading || !user) {
    return <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-sm h-[53px]" />;
  }

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const getInitial = (value: string) => value.charAt(0).toUpperCase();

  return (
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-sm">
      <div className="flex h-[52px] items-center justify-end px-8">
        <div className="flex items-center gap-6">

          {/* Notification Bell */}
          <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <Bell size={16} strokeWidth={1.8} />
          </button>

          {/* User Profile Info & Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                {name}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                software engineer
              </p>
            </div>

            {/* Avatar Container */}
            <div className="relative flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {user.profilePicture && !imgError ? (
                <Image
                  src={`${user.profilePicture}`}
                  alt={name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{getInitial(name)}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
