import { useState, useEffect } from "react";
import { RentalSpace } from "../types/rental-space";
import { rentalSpaceApi } from "../api/rental-space-api";
import { mockFloorPlans } from "../data/mock-floor-plans";
import { mockLocations } from "../data/mock-rental-spaces";

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

  const addRentalSpace = async (newSpace: RentalSpace) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const fp = mockFloorPlans.find((f) => f.locationId === String(buildingId));
      if (fp) {
        // Convert to visual MapElement on the building floor plan
        const newId = String(Date.now());
        const newElement = {
          id: newId,
          name: newSpace.name,
          label: newSpace.areaCode || newSpace.name,
          type: "area" as const,
          areaType: "shop" as const,
          status: "open" as const,
          x: 350,
          y: 330,
          width: 140,
          height: 120,
          rotation: 0,
          layerId: "shops",
          zone: "Food Zone",
          tenant: undefined,
          fillColor: "#d1fae5",
          strokeColor: "#059669"
        };
        fp.elements.push(newElement);
      } else {
        mockLocations.push(newSpace);
      }

      // Reload
      const result = await rentalSpaceApi.getByBuilding(buildingName, buildingId);
      setRentalSpaces(result);
    } catch (err) {
      console.error("Failed to add rental space:", err);
      setError("ไม่สามารถเพิ่มยูนิตเช่าได้");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rentalSpaces,
    isLoading,
    error,
    updateRentalSpace,
    addRentalSpace,
  };
}
