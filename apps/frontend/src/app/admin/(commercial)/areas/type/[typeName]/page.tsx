"use client"

import React, { useMemo, Suspense } from "react";
import { ArrowLeft, ArrowRight, MapPin, Store, Building2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import BuildingCard, { categoryIconMap } from "@/features/areas/components/admin/cards/BuildingCard";
import AreaStats from "@/features/areas/components/admin/AreaStats";
import AreaFilters from "@/features/areas/components/admin/AreaFilters";
import { mockLocations } from "@/features/areas/data/mock-rental-spaces";
import { mockBuildings } from "@/features/areas/data/mock-buildings";
import { RentalSpace } from "@/features/areas/types/rental-space";
import { Button } from "@/components/ui/button";

interface BuildingItem {
  id: number;
  name: string;
  building_type_id?: number;
  building_type_name?: string;
  rental_space_count: number;
  has_floor_plan: boolean;
}

function CategoryPageContent() {
  const router = useRouter();
  const params = useParams();

  const typeName = params.typeName ? decodeURIComponent(params.typeName as string) : "";

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // ดึงตึกย่อยในประเภทนี้
  const buildingsInSelectedType = useMemo(() => {
    return mockBuildings.filter((b: any) => b.building_type_name === typeName);
  }, [typeName]);

  // ดึงยูนิตย่อยทั้งหมดในประเภทนี้เพื่อนำไปคิด Stats และใช้กรอง
  const locationsInType = useMemo(() => {
    const buildingNames = buildingsInSelectedType.map((b: any) => b.name);
    return mockLocations.filter((loc) => buildingNames.includes((loc as any).building || "")) as RentalSpace[];
  }, [buildingsInSelectedType]);

  // กรองอาคารเพื่อแสดงผลใน Grid
  const filteredBuildings = useMemo(() => {
    let list = buildingsInSelectedType;

    // กรองด้วยช่องค้นหา
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b: any) => b.name.toLowerCase().includes(q));
    }

    // กรองด้วยสถานะ (แสดงเฉพาะตึกที่มียูนิตย่อยตรงตามสถานะที่เลือก)
    if (selectedStatus !== "all") {
      list = list.filter((b: any) => {
        const stalls = mockLocations.filter((loc) => (loc as any).building === b.name);
        return stalls.some((stall) => stall.status === selectedStatus);
      });
    }

    return list;
  }, [buildingsInSelectedType, searchQuery, selectedStatus]);

  // ดึงกลุ่มประเภทตึกจริงทั้งหมดเพื่อแสดงตัวกรอง Category แบบไดนามิก
  const dynamicCategories = useMemo(() => {
    const types = new Set<string>();
    mockBuildings.forEach((b: any) => {
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
  };

  const CategoryIcon = categoryIconMap[typeName] || Building2;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-305 pb-16">
      {/* Header Section (ทำความคล้าย /admin/tenants/lists/cafeterias) */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-linear-to-br from-card to-card/50 p-8 rounded-3xl border border-border/60 shadow-sm relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#f26522]/5 rounded-full blur-3xl" />

          <div className="flex items-start gap-5 relative z-10">
            {/* Back Button */}
            <button
              onClick={() => router.push("/admin/areas")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer self-center shrink-0"
              title="ย้อนกลับ"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f26522] text-white shadow-lg shadow-[#f26522]/20 ring-4 ring-[#f26522]/10">
              <CategoryIcon size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">{typeName}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
                  <MapPin size={14} className="text-[#f26522]" />
                  มี {buildingsInSelectedType.length} อาคาร/พื้นที่
                </span>
                <span className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
                  <Store size={14} className="text-[#f26522]" />
                  พื้นที่เช่าทั้งหมด {locationsInType.length} ยูนิต
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Panel (ใช้แบบย่อ: ซ่อน Dropdowns) */}
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
        showCategoryFilter={false}
        showStatusFilter={false}
        onReset={handleResetFilters}
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
            {filteredBuildings.map((b: any) => (
              <BuildingCard
                key={b.id}
                buildingName={b.name}
                locations={mockLocations.filter((loc) => (loc as any).building === b.name) as RentalSpace[]}
                isSelected={false}
                onSelect={() => router.push(`/admin/areas/building/${b.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBuildings.map((b: any) => (
              <div
                key={b.id}
                onClick={() => router.push(`/admin/areas/building/${b.id}`)}
                className="group bg-white rounded-xl border border-slate-200/60 p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#f26522]/20 transition-all duration-200"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#f26522] transition-colors">{b.name}</h3>
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
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in duration-300">
          <p className="text-base font-bold text-slate-700">ไม่พบตึกที่ตรงตามเงื่อนไขตัวกรอง</p>
          <Button variant="outline" onClick={handleResetFilters} className="mt-4">
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
