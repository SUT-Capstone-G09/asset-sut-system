"use client"

import React, { useMemo, Suspense } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import AreaStats from "@/features/areas/components/admin/AreaStats";
import AreaFilters from "@/features/areas/components/admin/AreaFilters";
import SpaceGrid from "@/features/areas/components/admin/SpaceGrid";
import { mockBuildings } from "@/features/areas/data/mock-buildings";
import { useRentalSpaces } from "@/features/areas/hooks/useRentalSpaces";
import { categoryIconMap } from "@/features/areas/components/admin/cards/BuildingCard";
import { RentalSpace } from "@/features/areas/types/rental-space";

function BuildingPageContent() {
  const router = useRouter();
  const params = useParams();

  const buildingId = params.buildingId ? Number(params.buildingId) : 0;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const building = useMemo(
    () => mockBuildings.find((b) => b.id === buildingId),
    [buildingId]
  );

  const { rentalSpaces: displayLocations, isLoading, updateRentalSpace } =
    useRentalSpaces(building?.name || "all", building?.id || 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
  };

  const handleBack = () => {
    if (building?.building_type_name) {
      router.push(`/admin/areas/type/${encodeURIComponent(building.building_type_name)}`);
    } else {
      router.push("/admin/areas");
    }
  };

  // ดึงกลุ่มประเภทตึกจริงทั้งหมดเพื่อแสดงตัวกรอง Category แบบไดนามิก
  const dynamicCategories = useMemo(() => {
    const types = new Set<string>();
    mockBuildings.forEach((b) => {
      if (b.building_type_name) {
        types.add(b.building_type_name);
      }
    });
    return Array.from(types).map((type) => ({ value: type, label: type }));
  }, []);

  const handleCategoryChange = (newCat: string) => {
    if (newCat === "all") {
      router.push("/admin/areas");
    } else {
      router.push(`/admin/areas/type/${encodeURIComponent(newCat)}`);
    }
  };

  if (!building) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">ไม่พบข้อมูลอาคาร/สถานที่</h2>
        <button
          onClick={() => router.push("/admin/areas")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-sm font-semibold transition-all"
        >
          ย้อนกลับหน้าแรก
        </button>
      </div>
    );
  }

  const BuildingIcon = building.building_type_name
    ? (categoryIconMap[building.building_type_name] || Building2)
    : Building2;

  const filteredSpaces = displayLocations.filter((space) => {
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

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Page Title & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f26522] text-white shadow-lg shadow-[#f26522]/20">
            <BuildingIcon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {building.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              หมวดหมู่: {building.building_type_name || "ทั่วไป"} | {building.rental_space_count} ล็อค/ยูนิตย่อย
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <AreaStats locations={displayLocations} />

      {/* Search & Filters Panel (ใช้แบบย่อ: ซ่อน Category Dropdown) */}
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
  );
}

export default function BuildingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <BuildingPageContent />
    </Suspense>
  );
}
