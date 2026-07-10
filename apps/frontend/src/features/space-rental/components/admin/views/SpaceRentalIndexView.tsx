"use client"

import { Plus, ArrowRight } from "lucide-react";
import BuildingCard from "../cards/BuildingCard";
import AreaStats from "../AreaStats";
import AreaFilters from "../AreaFilters";
import BuildingCreateDrawer from "../drawers/BuildingCreateDrawer";
import { useAreasDashboard } from "../../../hooks/useAreasDashboard";
import { RentalSpace } from "../../../types/rental-space";
import { mockLocations } from "../../../data/mock-rental-spaces";
import { Button } from "@/components/ui/button";

function IndexStats() {
  const allLocations = mockLocations as RentalSpace[];
  return <AreaStats locations={allLocations} />;
}

export default function SpaceRentalIndexView() {
  const {
    searchQuery,
    setSearchQuery,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    viewMode,
    setViewMode,
    isCreateOpen,
    setIsCreateOpen,
    isBuildingCreateOpen,
    setIsBuildingCreateOpen,
    dynamicCategories,
    visibleCards,
    handleCardSelect,
    handleResetFilters,
    handleAddBuilding,
  } = useAreasDashboard();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Page Title Header & Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            พื้นที่เช่า & ร้านค้า
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ระบบจัดการพื้นที่จัดสรรเชิงพาณิชย์ และรายชื่อผู้ประกอบการของมหาวิทยาลัย
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => setIsBuildingCreateOpen(true)}
            className="h-11 px-6 rounded-md font-bold text-xs text-white bg-[#f26522] hover:bg-[#d8561d] transition-all shadow-lg shadow-[#f26522]/20 gap-2 cursor-pointer flex items-center justify-center"
          >
            <Plus size={18} strokeWidth={3} />
            <span>เพิ่มอาคารใหม่</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <IndexStats />

      {/* Search & Filters Panel */}
      <AreaFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedTypeFilter}
        setSelectedCategory={setSelectedTypeFilter}
        selectedStatus={selectedStatusFilter}
        setSelectedStatus={setSelectedStatusFilter}
        categories={dynamicCategories}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onReset={handleResetFilters}
      />

      {/* Section label */}
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">ประเภทพื้นที่</h2>
      </div>

      {/* Dashboard Cards Grid/List */}
      {visibleCards.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleCards.map((card) => (
              <BuildingCard
                key={card.id}
                buildingName={card.name}
                locations={card.locations}
                isSelected={false}
                onSelect={() => handleCardSelect(card)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className="group bg-white rounded-md border border-slate-200/60 p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#f26522]/20 transition-all duration-200"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#f26522] transition-colors">{card.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {card.type === "group" ? "กลุ่มประเภทอาคาร" : "อาคารเดี่ยว"} | {card.locations.length} ยูนิตย่อย
                  </p>
                </div>
                <button className="shrink-0 size-10 rounded-md bg-slate-50 text-slate-400 group-hover:bg-[#f26522] group-hover:text-white transition-all flex items-center justify-center">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-md border-2 border-dashed border-slate-200 animate-in fade-in duration-300">
          <p className="text-base font-bold text-slate-700">ไม่พบตึกหรือประเภทพื้นที่ที่ตรงเงื่อนไข</p>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="mt-6 rounded-md border-slate-200 text-slate-600 font-bold text-xs"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}



      {/* Create Building Drawer */}
      <BuildingCreateDrawer
        open={isBuildingCreateOpen}
        onClose={() => setIsBuildingCreateOpen(false)}
        onAdd={handleAddBuilding}
      />
    </div>
  );
}
