"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminContractsDashboardView from "@/features/contracts/components/admin/AdminContractsDashboardView";

export default function AdminContractsDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-brand-primary mr-2" />
          กำลังโหลดข้อมูลสัญญาเช่า...
        </div>
      }
    >
      <AdminContractsDashboardView />
    </Suspense>
  );
}
