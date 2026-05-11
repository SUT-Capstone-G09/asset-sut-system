"use client"

import React from "react";
import {
  Plus,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AdminAreaCreateDrawer from "./AdminAreaCreateDrawer";

export default function AdminAreaHeader() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between lg:justify-start lg:gap-4">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Admin</span>
              <span className="size-1 rounded-full bg-slate-300" />
              <span className="text-[#f26522]">Areas Management</span>
            </nav>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              จัดการพื้นที่เช่า
            </h1>
            <p className="text-sm font-medium text-slate-500">
              ตรวจสอบสถานะ วิเคราะห์การใช้งาน และบริหารจัดการพื้นที่เชิงพาณิชย์ทั้งหมด
            </p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center">
          <Button
            onClick={() => setIsCreateDrawerOpen(true)}
            className={cn(
              "h-11 px-6 rounded-xl font-bold text-xs text-white",
              "bg-[#f26522] hover:bg-[#d8561d] transition-all",
              "shadow-lg shadow-[#f26522]/20 gap-2"
            )}
          >
            <Plus size={18} strokeWidth={3} />
            <span>เพิ่มสถานที่ใหม่</span>
          </Button>
        </div>
      </div>

      <AdminAreaCreateDrawer 
        open={isCreateDrawerOpen} 
        onClose={() => setIsCreateDrawerOpen(false)} 
      />
    </div>
  );
}