import { useState, useEffect, useMemo } from "react";
import { Building } from "../types/building";
import { buildingApi } from "../api/building-api";
import { mockLocations } from "../data/mock-rental-spaces";

export function useBuildings(searchQuery: string = "", activeTab: string = "ทั้งหมด") {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดข้อมูลตึกจาก API (จำลอง)
  useEffect(() => {
    let active = true;
    const fetchBuildings = async () => {
      setIsLoading(true);
      try {
        const result = await buildingApi.getAll();
        if (active) {
          setBuildings(result);
        }
      } catch (err) {
        if (active) {
          setError("ไม่สามารถดึงข้อมูลอาคารและสถานที่ได้");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchBuildings();
    return () => {
      active = false;
    };
  }, []);

  // สร้างรายชื่อประเภทอาคาร (Tabs)
  const buildingTypes = useMemo(() => {
    const types = Array.from(
      new Set(buildings.map((b) => b.building_type_name).filter(Boolean))
    ) as string[];
    const hasGeneral = buildings.some((b) => !b.building_type_name);
    return ["ทั้งหมด", ...types, ...(hasGeneral ? ["ทั่วไป"] : [])];
  }, [buildings]);

  // ฟิลเตอร์คัดกรองและค้นหาเจาะลึก (Deep Search)
  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      // 1. ตัวกรองแท็บหมวดหมู่
      if (activeTab !== "ทั้งหมด") {
        if (activeTab === "ทั่วไป") {
          if (b.building_type_name) return false;
        } else {
          if (b.building_type_name !== activeTab) return false;
        }
      }
      // 2. ตัวกรองคำค้นหา
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesBuildingName = b.name.toLowerCase().includes(q);
        const matchesInternalSpace = mockLocations.some(
          (loc) =>
            loc.building === b.name &&
            (loc.name.toLowerCase().includes(q) ||
              (loc.tenantName ?? "").toLowerCase().includes(q) ||
              (loc.areaCode ?? "").toLowerCase().includes(q))
        );
        return matchesBuildingName || matchesInternalSpace;
      }
      return true;
    });
  }, [buildings, activeTab, searchQuery]);

  const addBuilding = async (newBuildingData: Partial<Building>) => {
    try {
      const added = await buildingApi.create(newBuildingData);
      setBuildings((prev) => [added, ...prev]);
      return added;
    } catch (err) {
      console.error("Failed to add building:", err);
      throw err;
    }
  };

  return {
    buildings,
    filteredBuildings,
    buildingTypes,
    isLoading,
    error,
    addBuilding,
  };
}
