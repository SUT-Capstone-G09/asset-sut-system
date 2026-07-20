import { mockFloorPlans } from "../data/mock-floor-plans";
import { mockStallContracts } from "../data/mock-stall-contracts";
import { mockLocations } from "../data/mock-rental-spaces";
import { RentalSpace } from "../types/rental-space";
import { DEFAULT_RENTAL_SPACE_CONFIG, mapBusinessCategoryName } from "../constants";

/**
 * ดึงยูนิตย่อยในอาคาร (หากมีผังแคนวาสให้ดึงจากแผงลอยย่อย หากไม่มีดึงจาก mockLocations โดยตรง)
 */
export function resolveBuildingStallSpaces(buildingId: number, buildingName: string): RentalSpace[] {
  const fp = mockFloorPlans.find((f) => f.locationId === String(buildingId));
  if (fp) {
    const shops = fp.elements.filter((el) => el.type === "area" && el.areaType === "shop");
    return shops.map((shop) => {
      const labelKey = shop.label || "";
      const contract = mockStallContracts[labelKey];
      const mappedCategory = mapBusinessCategoryName(contract?.category);

      return {
        id: `${buildingId}-${shop.id}`,
        name: contract?.tenantName && contract.tenantName !== "-" ? contract.tenantName : shop.name,
        description: shop.description || `${shop.name} ภายใน ${buildingName}`,
        coordinates: DEFAULT_RENTAL_SPACE_CONFIG.coordinates,
        address: DEFAULT_RENTAL_SPACE_CONFIG.address,
        image: DEFAULT_RENTAL_SPACE_CONFIG.image,
        area: shop.areaType === "shop" ? "โรงอาหาร" : "ทั่วไป",
        building: buildingName,
        status: shop.status === "open" ? "available" : shop.status === "occupied" ? "occupied" : "maintenance",
        price: contract?.price || DEFAULT_RENTAL_SPACE_CONFIG.defaultPrice,
        size: DEFAULT_RENTAL_SPACE_CONFIG.defaultSize,
        areaCode: shop.label || shop.name,
        tenantName: contract?.tenantName || "-",
        contractNumber: contract?.contractNumber || "",
        contractEndDate: contract?.endDate || "",
        locationCategory: [mappedCategory],
      } as RentalSpace;
    });
  }

  // หากไม่มีแปลน ให้ดึงจากยูนิตเช่าเดี่ยวของตึกนั้นโดยตรง
  return (mockLocations as RentalSpace[]).filter((loc) => loc.building === buildingName);
}

/**
 * ฟังก์ชันช่วยตรวจสอบการค้นหาข้อความแบบรวมศูนย์
 */
export function matchSpaceSearch(loc: RentalSpace, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    loc.name.toLowerCase().includes(q) ||
    (loc.tenantName ?? "").toLowerCase().includes(q) ||
    (loc.areaCode ?? "").toLowerCase().includes(q) ||
    (loc.building ?? "").toLowerCase().includes(q)
  );
}
