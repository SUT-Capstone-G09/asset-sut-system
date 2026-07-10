import { useState, useEffect } from "react";
import { RentalSpace } from "../types/rental-space";
import { rentalSpaceApi } from "../api/rental-space-api";

export function useRentalSpaces(buildingName: string, buildingId: number) {
  const [rentalSpaces, setRentalSpaces] = useState<RentalSpace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (buildingName === "all") {
      setRentalSpaces([]);
      return;
    }

    let active = true;
    const fetchRentalSpaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await rentalSpaceApi.getByBuilding(buildingName, buildingId);
        if (active) {
          setRentalSpaces(result);
        }
      } catch (err) {
        if (active) {
          setError("ไม่สามารถดึงข้อมูลยูนิตเช่าย่อยได้");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchRentalSpaces();
    return () => {
      active = false;
    };
  }, [buildingName, buildingId]);

  const updateRentalSpace = async (id: string, updatedData: Partial<RentalSpace>) => {
    try {
      const updated = await rentalSpaceApi.update(id, updatedData);
      if (updated) {
        setRentalSpaces((prev) =>
          prev.map((space) => (space.id === id ? updated : space))
        );
      }
      return updated;
    } catch (err) {
      console.error("Failed to update rental space:", err);
      throw err;
    }
  };

  return {
    rentalSpaces,
    isLoading,
    error,
    updateRentalSpace,
  };
}
