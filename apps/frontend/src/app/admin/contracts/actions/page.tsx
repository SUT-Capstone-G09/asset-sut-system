"use client";

import React, { Suspense } from "react";
import { RefreshCw } from "lucide-react";
import AdminContractActionsView from "@/features/contracts/components/admin/AdminContractActionsView";

export default function AdminContractsActionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 font-bold flex items-center justify-center min-h-[50vh]">
          <RefreshCw className="animate-spin text-brand-primary mr-2" />
          กำลังโหลดข้อมูลการจัดการสัญญา...
        </div>
      }
    >
      <AdminContractActionsView />
    </Suspense>
  );
}
