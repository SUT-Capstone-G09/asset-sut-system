import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { mockBuildings } from "../data/mock-buildings";
import { RentalSpace } from "../types/rental-space";
import { mockFloorPlans } from "../data/mock-floor-plans";
import { CommercialCategoryType, COMMERCIAL_CATEGORIES } from "../constants";
import { resolveBuildingStallSpaces, matchSpaceSearch } from "../utils/stall-resolver";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // อ่านค่า filter จาก URL search params (persist ผ่าน navigation)
  const searchQuery = searchParams.get("q") ?? "";
  const selectedTypeFilter = searchParams.get("type") ?? "all";
  const selectedStatusFilter = searchParams.get("status") ?? "all";
  const selectedBuildingFilter = searchParams.get("building") ?? "all";
  const selectedBusinessTypeFilter = (searchParams.get("businessType") ?? "all") as CommercialCategoryType | "all";

  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBuildingCreateOpen, setIsBuildingCreateOpen] = useState(false);
  const [buildingsList, setBuildingsList] = useState(() => [...mockBuildings]);

  // helper: อัปเดต URL param โดยไม่ push history entry ใหม่
  const setParam = useCallback(
    (key: string, value: string, removeKeys: string[] = []) => {
      const params = new URLSearchParams(searchParams.toString());
      removeKeys.forEach((k) => params.delete(k));

      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setSearchQuery = (val: string) => setParam("q", val);
  const setSelectedTypeFilter = (val: string) => setParam("type", val, ["building", "businessType"]);
  const setSelectedStatusFilter = (val: string) => setParam("status", val);

  // เมื่อเลือก building → ลบ businessType อัตโนมัติ (mutual exclusive)
  const handleSelectBuilding = (val: string) => setParam("building", val, ["businessType"]);

  // เมื่อเลือก businessType → ลบ building อัตโนมัติ (mutual exclusive)
  const handleSelectBusinessType = (val: CommercialCategoryType | "all") => setParam("businessType", val, ["building"]);

  // โหมดแสดงผลการ์ดยูนิตย่อย (Space View) ทำงานเมื่อเลือก "อาคารเจาะจง", "ประเภทธุรกิจ" หรือ "สถานะ"
  const isSpaceViewMode =
    selectedBuildingFilter !== "all" ||
    selectedBusinessTypeFilter !== "all" ||
    selectedStatusFilter !== "all";

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

  // options สำหรับ dropdown เลือกอาคาร
  const buildingOptions = useMemo(() => {
    return buildingsList.map((b) => ({ value: String(b.id), label: b.name }));
  }, [buildingsList]);

  // ดึงข้อมูลพื้นที่เช่าทั้งหมดจากทุกอาคารแบบกระจายยูนิตจริง (รวมแผงลอยย่อยโรงอาหารด้วย)
  const allResolvedSpaces = useMemo((): RentalSpace[] => {
    const spaces: RentalSpace[] = [];
    buildingsList.forEach((b) => {
      spaces.push(...resolveBuildingStallSpaces(b.id, b.name));
    });
    return spaces;
  }, [buildingsList]);

  // สร้างการ์ด index (สำหรับ Building View Mode)
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
      const spaces = allResolvedSpaces.filter((loc) => buildingNames.includes(loc.building || ""));
      items.push({
        id: `type-${typeName}`,
        type: "group",
        name: typeName,
        buildingTypeName: typeName,
        locations: spaces,
      });
    });

    buildingsList
      .filter((b) => !b.building_type_name)
      .forEach((b) => {
        const spaces = allResolvedSpaces.filter((loc) => loc.building === b.name);
        items.push({
          id: `building-${b.id}`,
          type: "standalone",
          name: b.name,
          buildingId: b.id,
          locations: spaces,
        });
      });

    return items;
  }, [buildingsList, allResolvedSpaces]);

  // ผลลัพธ์ยูนิตย่อยสำหรับ Space View Mode (กรองตาม building หรือ businessType)
  const visibleSpaces = useMemo((): RentalSpace[] => {
    if (!isSpaceViewMode) return [];

    let results = allResolvedSpaces;

    // 1. กรองตาม Building เจาะจง
    if (selectedBuildingFilter !== "all") {
      const targetBuilding = buildingsList.find((b) => String(b.id) === selectedBuildingFilter);
      if (targetBuilding) {
        results = results.filter((loc) => loc.building === targetBuilding.name);
      }
    }

    // 2. กรองตาม Business Type
    if (selectedBusinessTypeFilter !== "all") {
      results = results.filter(
        (loc) => loc.locationCategory?.includes(selectedBusinessTypeFilter as CommercialCategoryType) ?? false
      );
    }

    // 3. กรองตาม Status
    if (selectedStatusFilter !== "all") {
      results = results.filter((loc) => loc.status === selectedStatusFilter);
    }

    // 4. กรองตาม Search Query
    if (searchQuery) {
      results = results.filter((loc) => matchSpaceSearch(loc, searchQuery));
    }

    return results;
  }, [isSpaceViewMode, selectedBuildingFilter, selectedBusinessTypeFilter, selectedStatusFilter, searchQuery, allResolvedSpaces, buildingsList]);

  // ผลลัพธ์การ์ดอาคารสำหรับ Building View Mode
  const visibleCards = useMemo(() => {
    let cards = dashboardCards;

    if (selectedTypeFilter !== "all") {
      cards = cards.filter(
        (c) => c.buildingTypeName === selectedTypeFilter || c.name === selectedTypeFilter
      );
    }

    if (selectedStatusFilter !== "all") {
      cards = cards.filter((c) => c.locations.some((loc) => loc.status === selectedStatusFilter));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter((card) =>
        card.name.toLowerCase().includes(q) ||
        card.locations.some((loc) => matchSpaceSearch(loc, searchQuery))
      );
    }

    return cards;
  }, [dashboardCards, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  const handleCardSelect = (card: DashboardCardItem) => {
    if (card.type === "group") {
      router.push(`/admin/space-rental/type/${encodeURIComponent(card.name)}`);
    } else {
      router.push(`/admin/space-rental/building/${card.buildingId}`);
    }
  };

  // reset ทุก filter พร้อมกันโดยแทน URL ใหม่สะอาด
  const handleResetFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const handleAddBuilding = async (data: { 
    name: string; 
    building_type_name?: string;
    address?: string;
    floor_count?: number;
    description?: string;
    lat?: number | null;
    lng?: number | null;
    has_floor_plan?: boolean;
    floor_plan_type?: "image" | "canvas";
    blueprint_url?: string;
  }) => {
    const newId = buildingsList.length + 1;
    const newBuilding = {
      id: newId,
      name: data.name,
      description: data.description || "",
      building_type_name: data.building_type_name || undefined,
      address: data.address || "มหาวิทยาลัยเทคโนโลยีสุรนารี",
      floor_count: data.floor_count || 1,
      lat: data.lat ?? undefined,
      lng: data.lng ?? undefined,
      rental_space_count: 0,
      has_floor_plan: data.has_floor_plan || false,
      blueprint_url: data.has_floor_plan && data.floor_plan_type === "image" ? data.blueprint_url || undefined : undefined,
    };

    mockBuildings.push(newBuilding);

    if (data.has_floor_plan && data.floor_plan_type === "canvas") {
      mockFloorPlans.push({
        id: `fp-${newId}`,
        locationId: String(newId),
        name: `ผังของ ${data.name}`,
        elements: [],
        layers: [
          {
            id: "shops",
            name: "ยูนิตย่อย/พื้นที่เช่า",
            visible: true,
            locked: false,
            color: "#3b82f6"
          }
        ],
        updatedAt: new Date().toISOString()
      });
    }

    setBuildingsList((prev) => [...prev, newBuilding]);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedBuildingFilter,
    handleSelectBuilding,
    buildingOptions,
    selectedBusinessTypeFilter,
    handleSelectBusinessType,
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
    businessTypeOptions: COMMERCIAL_CATEGORIES,
    isSpaceViewMode,
    allResolvedSpaces,
    visibleSpaces,
    visibleCards,
    handleCardSelect,
    handleResetFilters,
    handleAddBuilding,
  };
}
