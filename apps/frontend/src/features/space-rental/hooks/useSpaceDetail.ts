import { useState, useEffect, useMemo } from "react";
import { rentalSpaceApi } from "../api/rental-space-api";
import { mockBuildings } from "../data/mock-buildings";
import { RentalSpace } from "../types/rental-space";

export function useSpaceDetail(buildingId: number, spaceId: string) {
  const [location, setLocation] = useState<RentalSpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const building = useMemo(
    () => mockBuildings.find((b) => b.id === buildingId),
    [buildingId]
  );

  useEffect(() => {
    if (!building) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const fetchSpace = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const spaces = await rentalSpaceApi.getByBuilding(building.name, building.id);
        if (active) {
          const found = spaces.find((s) => s.id === spaceId);
          setLocation(found || null);
        }
      } catch (err) {
        if (active) {
          setError("Failed to fetch space details");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchSpace();
    return () => {
      active = false;
    };
  }, [building, spaceId]);

  const handleUpdateLocation = (updatedLoc: RentalSpace) => {
    setLocation(updatedLoc);
  };

  return {
    location,
    building,
    isLoading,
    error,
    handleUpdateLocation,
  };
}
