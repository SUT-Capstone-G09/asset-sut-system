import React, { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import BuildingCard from "../building/BuildingCard";
import AreaFilters from "./SpaceFilters";
import { useSpaceRentalType } from "../../hooks/useSpaceRentalType";
import { RentalSpace } from "../../types/rental-space";
import { mockLocations } from "../../data/mock-rental-spaces";
import { mockBuildings } from "../../data/mock-buildings";
import { Button } from "@/components/ui/button";
import { Building } from "../../types/building";

interface SpaceRentalTypeViewProps {
  typeName: string;
}

export default function SpaceRentalTypeView({
  typeName,
}: SpaceRentalTypeViewProps) {
  const router = useRouter();
  const { buildings, totalSpacesCount, isLoading } =
    useSpaceRentalType(typeName);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");

  // สร้าง buildingOptions จากอาคารที่อยู่ในกลุ่มหมวดหมู่นี้เท่านั้น
  const buildingOptions = useMemo(() => {
    return buildings.map((b) => ({ value: String(b.id), label: b.name }));
  }, [buildings]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedBuilding("all");
    setSelectedStatus("all");
  };

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b: Building) => {
      // กรองตามอาคารที่เลือกใน dropdown
      if (selectedBuilding !== "all" && String(b.id) !== selectedBuilding) {
        return false;
      }
      // กรองตามคำค้นหา
      if (
        searchQuery &&
        !b.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // กรองตามสถานะ
      if (selectedStatus !== "all") {
        const stalls = mockLocations.filter((loc) => loc.building === b.name);
        const hasStallWithStatus = stalls.some(
          (stall) => stall.status === selectedStatus,
        );
        if (!hasStallWithStatus) return false;
      }
      return true;
    });
  }, [buildings, selectedBuilding, searchQuery, selectedStatus]);

  // ดึงตระกูลหมวดหมู่ตึกทั้งหมดเพื่อใช้ส่งเป็น Dynamic Categories สำหรับตัวกรองหน้าตึก
  const dynamicCategories = useMemo(() => {
    const types = new Set<string>();
    mockBuildings.forEach((b: Building) => {
      if (b.building_type_name) {
        types.add(b.building_type_name);
      }
    });
    return Array.from(types).map((type) => ({ value: type, label: type }));
  }, []);

  const handleCategoryChange = (newCat: string) => {
    if (newCat === "all") {
      router.push("/admin/space-rental");
    } else {
      router.push(`/admin/space-rental/type/${encodeURIComponent(newCat)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header Section (Flat & Clean, matching formal layout) */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {typeName}
        </h1>
        <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
          <span>หมวดหมู่พื้นที่เชิงพาณิชย์</span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span>มีทั้งหมด {buildings.length} อาคาร</span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span>รวมทั้งหมด {totalSpacesCount} ยูนิตเช่าย่อย</span>
        </p>
      </div>

      {/* Search & Filters Panel */}
      <AreaFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={typeName}
        setSelectedCategory={handleCategoryChange}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        categories={dynamicCategories}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showCategoryFilter={true}
        showStatusFilter={false}
        showBuildingFilter={true}
        showBusinessTypeFilter={false}
        onReset={handleResetFilters}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={setSelectedBuilding}
        buildingOptions={buildingOptions}
      />

      {/* Section label */}
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-6 bg-[#f26522] rounded-full shadow-[0_0_15px_rgba(242,101,34,0.3)]" />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          รายชื่ออาคารในกลุ่ม ({typeName})
        </h2>
      </div>

      {/* Buildings Grid/List */}
      {filteredBuildings.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredBuildings.map((b) => (
              <BuildingCard
                key={b.id}
                buildingName={b.name}
                locations={
                  mockLocations.filter(
                    (loc) => loc.building === b.name,
                  ) as RentalSpace[]
                }
                isSelected={false}
                onSelect={() =>
                  router.push(`/admin/space-rental/building/${b.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBuildings.map((b) => (
              <div
                key={b.id}
                onClick={() =>
                  router.push(`/admin/space-rental/building/${b.id}`)
                }
                className="group bg-white rounded-md border border-slate-200/60 p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#f26522]/20 transition-all duration-200"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#f26522] transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {b.rental_space_count} ยูนิตย่อย
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
          <p className="text-base font-bold text-slate-700">
            ไม่พบตึกที่ตรงตามเงื่อนไขตัวกรอง
          </p>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="mt-4"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}
    </div>
  );
}
