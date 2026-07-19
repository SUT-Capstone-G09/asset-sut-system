"use client";

import React, { useMemo, useState } from "react";
import { Plus, Map, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import AreaStats from "./AreaStats";
import AreaFilters from "./SpaceFilters";
import SpaceGrid from "./SpaceGrid";
import SpaceCreateDrawer from "./SpaceCreateDrawer";
import FloorPlanViewer from "../floor-plan/FloorPlanViewer";
import { mockFloorPlans } from "../../data/mock-floor-plans";
import { useSpaceRentalBuilding } from "../../hooks/useSpaceRentalBuilding";
import { RentalSpace } from "../../types/rental-space";

interface SpaceRentalBuildingViewProps {
  buildingId: number;
}

export default function SpaceRentalBuildingView({
  buildingId,
}: SpaceRentalBuildingViewProps) {
  const router = useRouter();

  // เรียกใช้ hook เพื่อดึงข้อมูลหลักผ่าน API
  const {
    building,
    rentalSpaces,
    dynamicCategories,
    isLoading,
    updateRentalSpace,
    addRentalSpace,
  } = useSpaceRentalBuilding(buildingId);

  // สเตตระดับ UI จัดการแยกตามคำแนะนำที่ถูกต้อง
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
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

  const handleAddSpaceClick = () => {
    setIsCreateOpen(true);
  };

  // กรองข้อมูลด้วย useMemo
  const filteredSpaces = useMemo(() => {
    return rentalSpaces.filter((space: RentalSpace) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !space.name.toLowerCase().includes(q) &&
          !(space.areaCode ?? "").toLowerCase().includes(q) &&
          !(space.tenantName ?? "").toLowerCase().includes(q) &&
          !(space.description ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      if (selectedStatus !== "all" && space.status !== selectedStatus)
        return false;
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
        <h2 className="text-xl font-bold text-slate-800">
          ไม่พบข้อมูลอาคาร/สถานที่
        </h2>
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
            onClick={handleAddSpaceClick}
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
          hasFloorPlan={building.has_floor_plan || !!building.blueprint_url}
        />

        {/* Section label & Optional Edit Floor Plan Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {viewMode === "map" ? "แผนผังพื้นที่เช่าย่อย" : "พื้นที่เช่า / บูธร้านค้าทั้งหมด"}
            </h2>
          </div>

          {viewMode === "map" && !building.blueprint_url && (
            <button
              onClick={() => router.push(`/admin/space-rental/floor-plan/${building.id}`)}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all shadow-xs cursor-pointer"
            >
              <Edit size={14} />
              <span>แก้ไขผังพื้นที่</span>
            </button>
          )}
        </div>

        {/* Dynamic View Display */}
        {viewMode === "map" ? (
          (() => {
            // Case 1: If building has a static blueprint/floor plan image, render it directly
            if (building.blueprint_url) {
              return (
                <div className="bg-white p-6 rounded-md border border-slate-200/60 shadow-sm animate-in fade-in duration-300 space-y-4">
                  <div className="relative w-full rounded-md overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center min-h-[350px] max-h-[600px] group shadow-inner">
                    <img
                      src={building.blueprint_url}
                      alt={`Floor plan blueprint of ${building.name}`}
                      className="max-w-full max-h-[550px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-bold text-slate-400">รูปภาพผังแปลนอาคารจำลอง (Static Blueprint)</p>
                  </div>
                </div>
              );
            }

            // Case 2: Fallback to interactive canvas floor plan viewer
            const floorPlan = mockFloorPlans.find((fp) => fp.locationId === String(building.id)) || null;
            if (floorPlan) {
              return (
                <div className="bg-white p-6 rounded-md border border-slate-200/60 shadow-sm animate-in fade-in duration-300">
                  <FloorPlanViewer
                    data={floorPlan}
                    backgroundImageUrl={building.blueprint_url}
                    onStallClick={(stall) => {
                      router.push(`/admin/space-rental/building/${building.id}/space/${stall.id}?tab=tenant`);
                    }}
                  />
                </div>
              );
            }
            return (
              <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-md">
                <p className="text-sm font-bold text-slate-500">ไม่มีข้อมูลแผนผังสำหรับตึกนี้</p>
              </div>
            );
          })()
        ) : (
          /* Spaces Grid */
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
        )}
      </div>

      {/* Create Space Drawer */}
      <SpaceCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={addRentalSpace}
        defaultBuildingName={building.name}
        defaultAreaName={building.building_type_name || "อื่นๆ"}
        defaultCoordinates={building.coordinates}
        defaultAddress={building.address}
        isLockedContext={true}
      />
    </div>

  );
}
