"use client";

import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import AreaStats from "../AreaStats";
import AreaFilters from "../AreaFilters";
import SpaceGrid from "../SpaceGrid";
import SpaceCreateDrawer from "../drawers/SpaceCreateDrawer";
import { useSpaceRentalBuilding } from "../../../hooks/useSpaceRentalBuilding";
import { RentalSpace } from "../../../types/rental-space";

interface SpaceRentalBuildingViewProps {
  buildingId: number;
}

export default function SpaceRentalBuildingView({ buildingId }: SpaceRentalBuildingViewProps) {
  const router = useRouter();
  
  // เรียกใช้ hook เพื่อดึงข้อมูลหลักผ่าน API
  const {
    building,
    rentalSpaces,
    dynamicCategories,
    isLoading,
    updateRentalSpace,
  } = useSpaceRentalBuilding(buildingId);

  // สเตตระดับ UI จัดการแยกตามคำแนะนำที่ถูกต้อง
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
  };

  const handleBack = () => {
    router.push("/admin/space-rental");
  };

  const handleCategoryChange = (newCat: string) => {
    if (newCat === "all") {
      router.push("/admin/space-rental");
    } else {
      router.push(`/admin/space-rental/type/${encodeURIComponent(newCat)}`);
    }
  };

  // กรองข้อมูลด้วย useMemo
  const filteredSpaces = useMemo(() => {
    return rentalSpaces.filter((space) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !space.name.toLowerCase().includes(q) &&
          !(space.roomNumber ?? "").toLowerCase().includes(q) &&
          !(space.tenantName ?? "").toLowerCase().includes(q) &&
          !(space.description ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedStatus !== "all" && space.status !== selectedStatus) return false;
      return true;
    });
  }, [rentalSpaces, searchQuery, selectedStatus]);

  if (isLoading && !building) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
      </div>
    );
  }

  if (!building) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">ไม่พบข้อมูลอาคาร/สถานที่</h2>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 text-sm font-semibold transition-all"
        >
          ย้อนกลับหน้าแรก
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Section (Flat & Clean, matching type category style) */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {building.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
            <span>อาคารเชิงพาณิชย์</span>
            <span className="size-1 rounded-full bg-slate-300" />
            <span>หมวดหมู่: {building.building_type_name || "ทั่วไป"}</span>
            <span className="size-1 rounded-full bg-slate-300" />
            <span>{building.rental_space_count} ยูนิตเช่าย่อย</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-6 rounded-md font-bold text-xs text-white bg-[#f26522] hover:bg-[#d8561d] transition-all shadow-lg shadow-[#f26522]/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>เพิ่มพื้นที่เช่าใหม่</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <AreaStats locations={rentalSpaces} />

      {/* Content Section */}
      <div className="space-y-6">
        {/* Search & Filters Panel */}
        <AreaFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={building.building_type_name || "all"}
          setSelectedCategory={handleCategoryChange}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          categories={dynamicCategories}
          onReset={handleResetFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showCategoryFilter={false}
        />

        {/* Section label */}
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            พื้นที่เช่า / บูธร้านค้าทั้งหมด
          </h2>
        </div>

        {/* Spaces Grid */}
        <SpaceGrid
          filteredLocations={filteredSpaces}
          categories={[building.building_type_name || "ทั่วไป"]}
          onResetFilters={handleResetFilters}
          onUpdateLocation={async (loc: RentalSpace) => {
            await updateRentalSpace(loc.id, loc);
          }}
          isLoading={isLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Create Space Drawer */}
      <SpaceCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={() => {}}
        defaultBuildingName={building.name}
        defaultAreaName={building.building_type_name || "อื่นๆ"}
        isLockedContext={true}
      />
    </div>
  );
}
