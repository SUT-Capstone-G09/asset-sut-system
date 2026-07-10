import { useState, useEffect } from "react";
import { buildingApi } from "../api/rental-space-api";
import { Building } from "../types/building";

export function useSpaceRentalType(typeName: string) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [totalSpacesCount, setTotalSpacesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await buildingApi.getByType(typeName);
        if (active) {
          setBuildings(result.buildings);
          setTotalSpacesCount(result.totalSpacesCount);
        }
      } catch (err) {
        if (active) {
          setError("ไม่สามารถดึงข้อมูลกลุ่มอาคารได้");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [typeName]);

  return {
    buildings,
    totalSpacesCount,
    isLoading,
    error,
  };
}
