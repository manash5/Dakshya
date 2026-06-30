"use client"

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getProfile } from "@/lib/api/auth";
import Image from "next/image";

interface AdminProfile {
  name: string;
  role: string;
  avatarUrl: string | null;
}

export default function AdminHeader() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const response = await getProfile();
      const userData = response.data;

      if (userData) {
        setUser({
          name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "User",
          role: "Admin",
          avatarUrl: userData.profilePicture || null, 
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser({
        name: "Guest",
        role: "Viewer",
        avatarUrl: null,
      });
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

  // Helper to extract the first letter of the name
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Show a skeleton or nothing while loading data
  if (!user) {
    return <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-sm h-[53px]" />;
  }

  return (
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-sm">
      <div className="flex h-[52px] items-center justify-end px-8">
        <div className="flex items-center gap-6">
          
          {/* Notification Bell */}
          <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <Bell size={16} strokeWidth={1.8} />
          </button>

          {/* User Profile Info & Avatar */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {user.role}
                </p>
              </div>

              {/* Avatar Container */}
              <div className="relative flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
  {/* Conditional Render */}
  {user.avatarUrl && !imgError ? (
    <Image
      src={process.env.NEXT_PUBLIC_API_BASE_URL + user.avatarUrl}
      alt={user.name}
      fill 
      sizes="40px" 
      className="object-cover" 
      onError={() => setImgError(true)}
    />
  ) : (
    <span>{getInitial(user.name)}</span>
  )}
</div>
            </div>
          )}

        </div>
      </div>
    </header>
  ); 
}