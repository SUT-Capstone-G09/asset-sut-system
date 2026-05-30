"use client";

import { useState } from "react";
import { ShieldCheck, Users, UserCircle2 } from "lucide-react";
import AdminTab from "@/features/user-management/components/AdminTab";
import StaffTab from "@/features/user-management/components/StaffTab";
import RequesterTab from "@/features/user-management/components/RequesterTab";

const TABS = [
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "staff", label: "Staff", icon: Users },
  { id: "requester", label: "ผู้ขอใช้บริการ", icon: UserCircle2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AccessSettingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("admin");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="text-sm text-gray-400 mt-0.5">เพิ่ม แก้ไข และจัดการสิทธิ์ผู้ใช้งานในระบบ</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative flex-1 sm:flex-none justify-center sm:justify-start ${
                    isActive
                      ? "text-brand-primary"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6">
            {activeTab === "admin" && <AdminTab />}
            {activeTab === "staff" && <StaffTab />}
            {activeTab === "requester" && <RequesterTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
