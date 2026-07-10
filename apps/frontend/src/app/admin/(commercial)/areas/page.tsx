"use client"

import React, { useMemo, Suspense } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import BuildingCard from "@/features/areas/components/admin/cards/BuildingCard";
import AreaStats from "@/features/areas/components/admin/AreaStats";
import AreaFilters from "@/features/areas/components/admin/AreaFilters";
import SpaceCreateDrawer from "@/features/areas/components/admin/drawers/SpaceCreateDrawer";
import BuildingCreateDrawer from "@/features/areas/components/admin/drawers/BuildingCreateDrawer";
import { mockLocations } from "@/features/areas/data/mock-rental-spaces";
import { mockBuildings } from "@/features/areas/data/mock-buildings";
import { RentalSpace } from "@/features/areas/types/rental-space";
import { Button } from "@/components/ui/button";

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface DashboardCardItem {
  id: string;
  type: "group" | "standalone";
  name: string;
  buildingTypeName?: string;
  buildingId?: number;
  locations: RentalSpace[];
}

// -------------------------------------------------------
// Index Stats (level: "index") — คำนวณจาก mockLocations ทั้งหมด
// -------------------------------------------------------
function IndexStats() {
  const allLocations = mockLocations as RentalSpace[];
  return <AreaStats locations={allLocations} />;
}

// -------------------------------------------------------
// Main Page Content (Index View)
// -------------------------------------------------------
function AdminAreasPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isBuildingCreateOpen, setIsBuildingCreateOpen] = React.useState(false);
  const [buildingsList, setBuildingsList] = React.useState(() => [...mockBuildings]);

  // ดึงกลุ่มประเภทตึกจริงทั้งหมดจากฐานข้อมูล/mock เพื่อความยืดหยุ่นในอนาคต
  const dynamicCategories = useMemo(() => {
    const types = new Set<string>();
    buildingsList.forEach((b) => {
      if (b.building_type_name) {
        types.add(b.building_type_name);
      }
    });
    return Array.from(types).map((type) => ({ value: type, label: type }));
  }, [buildingsList]);

  // สร้างการ์ด index
  const dashboardCards = useMemo(() => {
    const items: DashboardCardItem[] = [];

    const groupedByType = buildingsList.reduce((acc, b) => {
      if (b.building_type_name) {
        if (!acc[b.building_type_name]) acc[b.building_type_name] = [];
        acc[b.building_type_name].push(b);
      }
      return acc;
    }, {} as Record<string, typeof mockBuildings>);

    Object.entries(groupedByType).forEach(([typeName, buildingsInType]) => {
      const buildingNames = buildingsInType.map((b) => b.name);
      const spaces = mockLocations.filter((loc) => buildingNames.includes((loc as any).building || ""));
      items.push({
        id: `type-${typeName}`,
        type: "group",
        name: typeName,
        buildingTypeName: typeName,
        locations: spaces as RentalSpace[],
      });
    });

    buildingsList
      .filter((b) => !b.building_type_name)
      .forEach((b) => {
        const spaces = mockLocations.filter((loc) => (loc as any).building === b.name);
        items.push({
          id: `building-${b.id}`,
          type: "standalone",
          name: b.name,
          buildingId: b.id,
          locations: spaces as RentalSpace[],
        });
      });

    return items;
  }, [buildingsList]);

  const visibleCards = useMemo(() => {
    let cards = dashboardCards;

    // filter ตามประเภท
    if (selectedTypeFilter !== "all") {
      cards = cards.filter(
        (c) => c.buildingTypeName === selectedTypeFilter || c.name === selectedTypeFilter
      );
    }

    // filter ตามสถานะ (เช็คว่าในการ์ดมียูนิตที่ตรงกับสถานะไหม)
    if (selectedStatusFilter !== "all") {
      cards = cards.filter((c) => c.locations.some((loc) => loc.status === selectedStatusFilter));
    }

    // filter ตาม search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter((card) =>
        card.name.toLowerCase().includes(q) ||
        card.locations.some((loc) =>
          loc.name.toLowerCase().includes(q) ||
          (loc.tenantName ?? "").toLowerCase().includes(q) ||
          (loc.roomNumber ?? "").toLowerCase().includes(q)
        )
      );
    }

    return cards;
  }, [dashboardCards, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  const handleCardSelect = (card: DashboardCardItem) => {
    if (card.type === "group") {
      // ไปที่หน้าหมวดหมู่ โดยเข้ารหัส URL
      router.push(`/admin/areas/type/${encodeURIComponent(card.name)}`);
    } else {
      // ไปหน้ารายละเอียดของตึกเดี่ยวตรงๆ
      router.push(`/admin/areas/building/${card.buildingId}`);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Page Title & Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            จัดการพื้นที่เช่าทั้งหมด
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            คัดกรองตามประเภทอาคาร หรือค้นหายูนิตเช่าย่อยภายในตึก
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsBuildingCreateOpen(true)}
            variant="outline"
            className="h-11 px-6 rounded-[7px] font-bold text-xs text-[#f26522] border-[#f26522] hover:bg-[#f26522]/5 transition-all shadow-sm gap-2 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>เพิ่มอาคารใหม่</span>
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-6 rounded-[7px] font-bold text-xs text-white bg-[#f26522] hover:bg-[#d8561d] transition-all shadow-lg shadow-[#f26522]/20 gap-2 cursor-pointer"
          >
            <Plus size={18} strokeWidth={3} />
            <span>เพิ่มสถานที่ใหม่</span>
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
        onReset={() => {
          setSearchQuery("");
          setSelectedTypeFilter("all");
          setSelectedStatusFilter("all");
        }}
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
                className="group bg-white rounded-xl border border-slate-200/60 p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#f26522]/20 transition-all duration-200"
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
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in duration-300">
          <p className="text-base font-bold text-slate-700">ไม่พบตึกหรือประเภทพื้นที่ที่ตรงเงื่อนไข</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedTypeFilter("all");
              setSelectedStatusFilter("all");
            }}
            className="mt-6 rounded-lg border-slate-200 text-slate-600 font-bold text-xs"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      )}

      {/* Create Drawer */}
      <SpaceCreateDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={() => {}}
      />

      {/* Create Building Drawer */}
      <BuildingCreateDrawer
        open={isBuildingCreateOpen}
        onClose={() => setIsBuildingCreateOpen(false)}
        onAdd={async (data) => {
          const newBuilding = {
            id: buildingsList.length + 1,
            name: data.name,
            building_type_name: data.building_type_name || undefined,
            rental_space_count: 0,
            has_floor_plan: false,
          };
          
          // เพิ่มเข้าไปใน Mock array เพื่อให้ใช้ได้ทั่วถึง
          mockBuildings.push(newBuilding);
          
          // อัปเดต React State เพื่อบังคับให้ UI re-render คัดกรองอาคารใหม่ทันที
          setBuildingsList((prev) => [...prev, newBuilding]);
        }}
      />
    </div>
  );
}

export default function AdminAreasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
        </div>
      }
    >
      <AdminAreasPageContent />
    </Suspense>
  );
}