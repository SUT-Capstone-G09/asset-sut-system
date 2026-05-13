"use client";

import React, { useState } from "react";
import { InvoiceHeader } from "@/features/invoices/components/InvoiceHeader";
import { TenantSelector } from "@/features/invoices/components/TenantSelector";
import { InvoiceSummary } from "@/features/invoices/components/InvoiceSummary";
import { UploadInvoiceModal } from "@/features/invoices/components/UploadInvoiceModal";
import { Tenant } from "@/features/invoices/types";

export default function InvoicesPage() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 ">
      {/* Header */}
      <InvoiceHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Tenant Selection (2-step filter + search) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">ระบุผู้เช่าที่ต้องการ</h2>
            <p className="text-sm text-slate-400">เลือกสถานที่และผู้เช่าที่ต้องการอัพโหลดใบแจ้งหนี้</p>
          </div>
          <TenantSelector
            onSelect={setSelectedTenant}
            selectedTenantId={selectedTenant?.id}
          />
        </div>

        {/* Right: Summary & Action */}
        <div className="lg:col-span-1 sticky top-32">
          <InvoiceSummary
            tenant={selectedTenant}
            onUploadClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadInvoiceModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        tenant={selectedTenant}
      />
    </div>
  );
}