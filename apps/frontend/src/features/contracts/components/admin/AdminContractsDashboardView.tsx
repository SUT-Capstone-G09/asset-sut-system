import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { tenantAreaOptions } from "@/features/space-rental/data/tenant-areas";
import ContractStats from "./ContractStats";
import ContractFilters from "./ContractFilters";
import ContractTable from "./ContractTable";
import ContractRenewalRequestsTable from "./ContractRenewalRequestsTable";
import CreateContractDrawer from "./CreateContractDrawer";
import { useContractsDashboard } from "../../hooks/useContractsDashboard";
import { cn } from "@/lib/utils";

export default function AdminContractsDashboardView() {
  const {
    searchTerm,
    setSearchTerm,
    selectedArea,
    setSelectedArea,
    selectedStatus,
    setSelectedStatus,
    selectedBusinessType,
    setSelectedBusinessType,
    selectedYear,
    setSelectedYear,
    isCreateModalOpen,
    setIsCreateModalOpen,
    initialAreaId,
    toast,
    showToast,
    handleResetFilters,
    handleCreateSuccess,
    stats,
    filteredAndSortedContracts,
    handleViewTenant,
    handleManageContract,
  } = useContractsDashboard();

  const [activeTab, setActiveTab] = useState<"active-contracts" | "renewal-requests">("active-contracts");

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-120 flex items-center gap-3 bg-neutral-800 text-white px-6 py-4 rounded-[7px] shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-success-500" size={20} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            สัญญาเช่าพื้นที่เชิงพาณิชย์
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            สัญญาเช่าพื้นที่เชิงพาณิชณ์ (สัญญาเช่าระยะยาว)
          </p>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <ContractStats stats={stats} />

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("active-contracts")}
          className={cn(
            "flex items-center gap-2 px-6 pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "active-contracts"
              ? "border-b-2 border-[#f26522] text-[#f26522]"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          สัญญาเช่าปัจจุบัน
        </button>
        <button
          onClick={() => setActiveTab("renewal-requests")}
          className={cn(
            "flex items-center gap-2 px-6 pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "renewal-requests"
              ? "border-b-2 border-[#f26522] text-[#f26522]"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          คำร้องขอต่ออายุสัญญา
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "active-contracts" ? (
        <>
          {/* Search and Filters panel */}
          <ContractFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedArea={selectedArea}
            onAreaChange={setSelectedArea}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedBusinessType={selectedBusinessType}
            onBusinessTypeChange={setSelectedBusinessType}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onResetFilters={handleResetFilters}
            areaOptions={tenantAreaOptions}
          />

          {/* Contracts Table List */}
          <ContractTable
            contracts={filteredAndSortedContracts}
            onViewTenant={handleViewTenant}
            onManageContract={handleManageContract}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        </>
      ) : (
        <ContractRenewalRequestsTable />
      )}

      {/* Create Contract Drawer */}
      <CreateContractDrawer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        initialAreaId={initialAreaId}
        onErrorToast={(msg) => showToast(msg, "error")}
      />
    </div>
  );
}
