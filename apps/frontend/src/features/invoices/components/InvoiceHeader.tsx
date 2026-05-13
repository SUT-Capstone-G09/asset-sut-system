"use client";

import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";

export function InvoiceHeader() {
  return (
    <div className="space-y-2">
      <AssetBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "การเงิน", href: "/admin/finance" },
          { label: "อัพโหลดใบแจ้งหนี้" },
        ]}
      />
      <h1 className="text-3xl font-black tracking-tight text-slate-900">
        อัพโหลดใบแจ้งหนี้
      </h1>
    </div>
  );
}
