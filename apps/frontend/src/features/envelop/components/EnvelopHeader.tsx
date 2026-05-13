"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

export default function EnvelopHeader() {
  return (
    <div className="space-y-2">
      {/* Breadcrumb */}
      <AssetBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "การเงิน", href: "/admin/finance" },
          { label: "จัดการซอง" },
        ]}
      />

      {/* Title Row */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            จัดการซอง
          </h1>
          <p className="text-sm text-slate-500">จัดการซองเอกสารต่างๆ</p>
        </div>
      </div>
    </div>
  );
}
