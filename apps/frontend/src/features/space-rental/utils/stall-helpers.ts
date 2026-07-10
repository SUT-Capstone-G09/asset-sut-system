import { mockFloorPlans } from "../data/mock-floor-plans";
import { MapElement } from "../types/floor-plan";

export interface CanteenStallStats {
  stalls: MapElement[];
  total: number;
  occupied: number;
  vacant: number;
  inactive: number;
  occupancyPercent: number;
}

/**
 * Calculates canteen sub-stall statistics for a given location ID.
 * Falls back to default counts based on defaultStallCount if floor plan doesn't exist.
 */
export function getCanteenStallStats(locationId: string, defaultStallCount = 0): CanteenStallStats {
  const floorPlan = mockFloorPlans.find((fp) => fp.locationId === locationId);
  
  if (!floorPlan) {
    const total = defaultStallCount;
    const occupied = Math.floor(defaultStallCount * 0.75);
    const vacant = defaultStallCount - occupied;
    return {
      stalls: [],
      total,
      occupied,
      vacant,
      inactive: 0,
      occupancyPercent: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }

  const stalls = floorPlan.elements.filter(
    (el) => el.type === "area" && el.areaType === "shop"
  );
  const total = stalls.length;
  const occupied = stalls.filter((s) => s.status === "occupied").length;
  const vacant = stalls.filter((s) => s.status === "open").length;
  const inactive = stalls.filter((s) => s.status === "maintenance").length;
  const occupancyPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return {
    stalls,
    total,
    occupied,
    vacant,
    inactive,
    occupancyPercent,
  };
}
