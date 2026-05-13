"use client";

import React from "react";
import { Search, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTopbarProps {
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Whether to show the search input. Defaults to true. */
  showSearch?: boolean;
}

/**
 * A shared Topbar component for Dashboard layouts (Admin, Operator, User).
 * Handles search, notifications, settings, and profile actions.
 */
export default function DashboardTopbar({
  searchPlaceholder = "ค้นหา...",
  showSearch = true,
}: DashboardTopbarProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-25 bg-white/80 backdrop-blur-md border-b border-gray-200 z-[97] flex items-center justify-end px-8">
      {/* Right Actions */}
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

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2.5 rounded-xl text-slate-400 hover:text-[#f26522] hover:bg-[#f26522]/5 transition-all relative group">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#f26522] rounded-full border-2 border-white" />
          </button>
          
          <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block mx-2" />

        {/* Profile Placeholder */}
        <button className="flex items-center gap-3 group ml-1">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden group-hover:border-[#f26522]/30 group-hover:ring-4 group-hover:ring-[#f26522]/5 transition-all flex items-center justify-center">
             <div className="w-5 h-5 bg-slate-100 rounded-md border border-slate-200/50" />
          </div>
        </button>
      </div>
    </header>
  );
}
