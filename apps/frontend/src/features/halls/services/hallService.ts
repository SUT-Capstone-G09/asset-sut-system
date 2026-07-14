import {
  AdminLocationDTO,
  getLocations,
  getLocationTypes,
} from "@/features/booking/services/locationService";
import { Hall } from "../types/hall";

// ชื่อ location type ของโถง (type_id 4 ตาม seed) — resolve id จริงตอน runtime ผ่าน getLocationTypes()
export const HALL_TYPE_NAME = "โถงอาคาร";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

export function locationToHall(loc: AdminLocationDTO): Hall {
  const image = loc.image_url ?? DEFAULT_IMAGE;
  const pick = (reqKeyword: string, rateType: string) =>
    loc.pricing_tiers?.find(
      (t) => t.requester_type?.includes(reqKeyword) && t.rate_type === rateType
    )?.price ?? 0;

  return {
    id: String(loc.id),
    name: loc.name,
    buildingId: loc.building_id ? String(loc.building_id) : undefined,
    building: loc.building ?? "",
    category: loc.type,
    image,
    status: loc.status === "available" ? "available" : "maintenance",
    notes: "",
    rates: {
      hourlyInternal: pick("ภายใน", "hourly"),
      hourlyExternal: pick("ภายนอก", "hourly"),
      hourlyOffPeakInternal: pick("ภายใน", "hourly_offpeak"),
      hourlyOffPeakExternal: pick("ภายนอก", "hourly_offpeak"),
      dailyInternal: pick("ภายใน", "daily"),
      dailyExternal: pick("ภายนอก", "daily"),
    },
  };
}

// ดึงเฉพาะ location ที่เป็นโถง
export async function getHalls(): Promise<AdminLocationDTO[]> {
  const all = await getLocations();
  return all.filter((l) => l.type === HALL_TYPE_NAME);
}

// หา type_id ของ "โถงอาคาร"
export async function getHallTypeId(): Promise<number> {
  const types = await getLocationTypes();
  const t = types.find((x) => x.type === HALL_TYPE_NAME);
  if (!t) throw new Error(`ไม่พบประเภทสถานที่: ${HALL_TYPE_NAME}`);
  return t.id;
}

// re-export CRUD เดิมของ location เพื่อให้ hook ใช้จากที่เดียว
export {
  createLocation,
  updateLocation,
  deleteLocation,
  savePricingTiers,
} from "@/features/booking/services/locationService";
