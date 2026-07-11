import { useState, useEffect } from "react";
import { buildingApi } from "../api/rental-space-api";
import { useRentalSpaces } from "./useRentalSpaces";
import { Building } from "../types/building";

export function useSpaceRentalBuilding(buildingId: number) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<{ value: string; label: string }[]>([]);
  const [buildingLoading, setBuildingLoading] = useState(true);
  const [buildingError, setBuildingError] = useState<string | null>(null);

  // ดึงข้อมูลอาคารและหมวดหมู่ทั้งหมด
  useEffect(() => {
    let active = true;
    const fetchBuilding = async () => {
      setBuildingLoading(true);
      setBuildingError(null);
      try {
        const [b, categories] = await Promise.all([
          buildingApi.getById(buildingId),
          buildingApi.getAllTypes(),
        ]);
        if (active) {
          setBuilding(b);
          setDynamicCategories(categories);
        }
      } catch (err) {
        if (active) {
          setBuildingError("ไม่สามารถดึงข้อมูลอาคารได้");
        }
      } finally {
        if (active) {
          setBuildingLoading(false);
        }
      }
    };

    fetchBuilding();
    return () => {
      active = false;
    };
  }, [buildingId]);

  // ดึงพื้นที่เช่าย่อยภายในอาคารนี้
  const {
    rentalSpaces,
    isLoading: spacesLoading,
    error: spacesError,
    updateRentalSpace,
  } = useRentalSpaces(building?.name || "all", building?.id || 0);

  const isLoading = buildingLoading || spacesLoading;
  const error = buildingError || spacesError;

  return {
    building,
    rentalSpaces,
    dynamicCategories,
    isLoading,
    error,
    updateRentalSpace,
  };
}
