"use client";

import { Search, Bell, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardTopbarProps {
  searchPlaceholder?: string;
  showSearch?: boolean;
}

export default function DashboardTopbar({
  searchPlaceholder = "ค้นหา...",
  showSearch = true,
}: DashboardTopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const initial = fullName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <header className="fixed top-0 left-64 right-0 h-25 bg-white/80 backdrop-blur-md border-b border-gray-200 z-[97] flex items-center justify-end px-8">
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        {showSearch && (
          <div className="relative w-[450px] group hidden xl:block">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#f26522] transition-colors">
              <Search size={15} strokeWidth={3} />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className={cn(
                "block w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-100",
                "rounded-lg text-sm transition-all outline-none shadow-sm",
                "focus:bg-white focus:border-[#f26522]/30 focus:ring-4 focus:ring-[#f26522]/5 placeholder:text-slate-400 font-light"
              )}
            />
          </div>
        )}

        {/* Notification */}
        <button className="p-2.5 rounded-xl text-slate-400 hover:text-[#f26522] hover:bg-[#f26522]/5 transition-all relative">
          <Bell size={20} strokeWidth={2} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#f26522] rounded-full border-2 border-white" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Menu */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 group outline-none">
              <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:ring-4 group-hover:ring-brand-primary/10 transition-all">
                <span className="text-sm font-bold text-brand-primary">{initial}</span>
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold text-gray-800 max-w-[140px] truncate">{fullName || user?.email}</span>
                <span className="text-[10px] text-gray-400 capitalize mt-0.5">{user?.role}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 p-2 z-[200]">
            <div className="px-3 py-2 mb-1 border-b border-gray-50">
              <p className="text-xs text-gray-400">เข้าสู่ระบบในฐานะ</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg"
            >
              <LogOut size={15} />
              <span className="text-sm font-medium">ออกจากระบบ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
