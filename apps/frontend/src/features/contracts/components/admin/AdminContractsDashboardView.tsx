import React from "react";
import { CheckCircle, Plus } from "lucide-react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import ContractStats from "./ContractStats";
import ContractFilters from "./ContractFilters";
import ContractTable from "./ContractTable";
import CreateContractDrawer from "./CreateContractDrawer";
import { useContractsDashboard } from "../../hooks/useContractsDashboard";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-120 flex items-center gap-3 bg-neutral-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="text-success-500" size={20} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Title & Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            การจัดการสัญญาเช่าทั้งหมด (Lease Contracts)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ระบบรวมศูนย์ข้อมูลสัญญาเช่า สัญญาพื้นที่ประกอบการค้า และประวัติการทำสัญญาย้อนหลังในทุกพื้นที่ของมหาวิทยาลัย
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-11 px-6 rounded-[7px] font-bold text-xs text-white bg-[#f26522] hover:bg-[#d8561d] transition-all shadow-lg shadow-[#f26522]/20 gap-2 cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          <span>สร้างสัญญาใหม่</span>
        </Button>
      </div>

      {/* Summary Stats Cards */}
      <ContractStats stats={stats} />

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
      />

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
