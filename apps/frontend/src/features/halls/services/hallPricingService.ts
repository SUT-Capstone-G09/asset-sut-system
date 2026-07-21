import { apiClient } from "@/lib/services/api-client";
import {
  BuildingWithPricing,
  CreateHallPurposeInput,
  HallPricingRow,
  HallUsagePurpose,
  UpdateBuildingHallPricingInput,
  UpdateHallPricingInput,
  UpdateHallPurposeInput,
} from "../types/pricing";

// วัตถุประสงค์การขอใช้พื้นที่โถง — includeInactive=true คืนทั้งหมด (หน้าจัดการ) ไม่งั้นเฉพาะที่เปิดใช้งาน
export async function getHallUsagePurposes(
  includeInactive = false
): Promise<HallUsagePurpose[]> {
  const q = includeInactive ? "?include_inactive=true" : "";
  return apiClient.get<HallUsagePurpose[]>(`/hall-usage-purposes${q}`);
}

// เพิ่มวัตถุประสงค์ใหม่ (pricing_model จำกัด 2 แบบเดิม — ไม่กระทบ logic การคิดเงิน)
export async function createHallUsagePurpose(
  payload: CreateHallPurposeInput
): Promise<HallUsagePurpose> {
  return apiClient.post<HallUsagePurpose>("/hall-usage-purposes", payload);
}

// แก้วัตถุประสงค์ (เปิด-ปิด / แก้ชื่อ-ราคาตั้งต้น ฯลฯ — แก้ pricing_model ไม่ได้)
export async function updateHallUsagePurpose(
  id: number,
  payload: UpdateHallPurposeInput
): Promise<HallUsagePurpose> {
  return apiClient.put<HallUsagePurpose>(
    `/hall-usage-purposes/${id}`,
    payload
  );
}

// อาคารทั้งหมด พร้อมราคาโถงของแต่ละอาคาร (hall_pricings)
export async function getBuildingsWithPricing(): Promise<BuildingWithPricing[]> {
  return apiClient.get<BuildingWithPricing[]>("/buildings");
}

// ราคาของโถงหนึ่ง ครบทุกวัตถุประสงค์ (ราคาอาคาร = ขั้นต่ำ + ราคาเฉพาะโถง + ราคาที่ใช้จริง)
export async function getHallPricings(
  locationId: number
): Promise<HallPricingRow[]> {
  return apiClient.get<HallPricingRow[]>(`/locations/${locationId}/hall-pricings`);
}

// ตั้ง/แก้ราคาเฉพาะโถง (ทำเลทอง) — price null = ล้าง override ; ต่ำกว่าราคาอาคารจะถูก backend ปฏิเสธ
export async function updateHallPricings(
  locationId: number,
  pricings: UpdateHallPricingInput[]
): Promise<HallPricingRow[]> {
  return apiClient.put<HallPricingRow[]>(
    `/locations/${locationId}/hall-pricings`,
    { pricings }
  );
}

// ตั้ง/แก้ราคาโถงของอาคารหนึ่ง (bulk upsert รายวัตถุประสงค์) — คืนอาคารพร้อมราคาล่าสุด
export async function updateBuildingHallPricings(
  buildingId: number,
  pricings: UpdateBuildingHallPricingInput[]
): Promise<BuildingWithPricing> {
  return apiClient.put<BuildingWithPricing>(
    `/buildings/${buildingId}/hall-pricings`,
    { pricings }
  );
}
