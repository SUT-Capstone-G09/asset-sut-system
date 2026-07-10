import { RentalSpace } from "../types/rental-space";
import { FloorPlanData } from "../types/floor-plan";

export interface BuildingStats {
  totalUnits: number;
  occupied: number;
  vacant: number;
}

export function calculateBuildingStats(
  locations: RentalSpace[],
  floorPlans: FloorPlanData[]
): BuildingStats {
  if (locations.length === 0) {
    return { totalUnits: 0, occupied: 0, vacant: 0 };
  }

  const floorPlanMap = new Map(
    floorPlans.map((plan) => [plan.locationId, plan])
  );

  let totalUnits = 0;
  let occupied = 0;
  let vacant = 0;

  for (const location of locations) {
    const floorPlan = floorPlanMap.get(location.id);

    if (floorPlan) {
      const shops = floorPlan.elements.filter(
        (element) => element.type === "area" && element.areaType === "shop"
      );

      totalUnits += shops.length;
      occupied += shops.filter((shop) => shop.status === "occupied").length;
      vacant += shops.filter((shop) => shop.status === "open").length;
      continue;
    }

    if (location.area === "โรงอาหาร") {
      const stallCount = location.subStallCount ?? 0;
      const occupiedCount = Math.floor(stallCount * 0.75);

      totalUnits += stallCount;
      occupied += occupiedCount;
      vacant += stallCount - occupiedCount;
      continue;
    }

    totalUnits++;
    if (location.status === "occupied") {
      occupied++;
    } else {
      vacant++;
    }
  }

  return { totalUnits, occupied, vacant };
}