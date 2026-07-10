import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockBuildings } from "../data/mock-buildings";
import { mockLocations } from "../data/mock-rental-spaces";
import { RentalSpace } from "../types/rental-space";

export interface DashboardCardItem {
  id: string;
  type: "group" | "standalone";
  name: string;
  buildingTypeName?: string;
  buildingId?: number;
  locations: RentalSpace[];
}

export function useAreasDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBuildingCreateOpen, setIsBuildingCreateOpen] = useState(false);
  const [buildingsList, setBuildingsList] = useState(() => [...mockBuildings]);

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
      router.push(`/admin/space-rental/type/${encodeURIComponent(card.name)}`);
    } else {
      // ไปหน้ารายละเอียดของตึกเดี่ยวตรงๆ
      router.push(`/admin/space-rental/building/${card.buildingId}`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTypeFilter("all");
    setSelectedStatusFilter("all");
  };

  const handleAddBuilding = async (data: { name: string; building_type_name?: string }) => {
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
  };

  return {
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
    buildingsList,
    dynamicCategories,
    visibleCards,
    handleCardSelect,
    handleResetFilters,
    handleAddBuilding,
  };
}
