"use client";

import React, { useState } from "react";
import { InvoiceHeader } from "@/features/invoices/components/details/InvoiceHeader";
import { TenantSelector } from "@/features/invoices/components/tenants/TenantSelector";
import { TenantInfoCard } from "@/features/invoices/components/tenants/TenantInfoCard";
import { LatestInvoiceCard } from "@/features/invoices/components/details/LatestInvoiceCard";
import { UploadInvoiceModal } from "@/features/invoices/components/modals/UploadInvoiceModal";
import { Tenant, SavedInvoice } from "@/features/invoices/types";

export default function InvoicesPage() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);

  const handleSave = (invoice: SavedInvoice) => {
    setSavedInvoices((prev) => [invoice, ...prev]);
  };

  // TODO: navigate to tenant history page
  const handleViewHistory = (tenant: Tenant) => {
    console.log("View history for", tenant.id);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <InvoiceHeader />

      {/* Main Content: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start lg:min-h-[750px]">
        {/* Left: Tenant Selector (search + list + pagination) */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-md p-6 shadow-sm">
          <TenantSelector
            onSelect={setSelectedTenant}
            selectedTenantId={selectedTenant?.id}
          />
        </div>

        {/* Right: Tenant Info + Latest Invoice */}
        <div className="lg:col-span-2 flex flex-col gap-4 sticky top-28">
          <TenantInfoCard
            tenant={selectedTenant}
            onProceed={() => setIsModalOpen(true)}
          />
          <LatestInvoiceCard
            tenant={selectedTenant}
            savedInvoices={savedInvoices}
            onViewHistory={handleViewHistory}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadInvoiceModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        tenant={selectedTenant}
        onSave={handleSave}
      />
    </div>
  );
}