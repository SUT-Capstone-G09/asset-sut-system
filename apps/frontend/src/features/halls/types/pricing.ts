// ราคาการขอใช้พื้นที่โถง — ตั้งราย "อาคาร × วัตถุประสงค์" (ใช้ร่วมทุกโถงในอาคารเดียวกัน)

export type HallPricingModel = "per_sqm" | "per_type_per_day";

// วัตถุประสงค์การขอใช้พื้นที่โถง (master data) — 3 ประเภท: ตั้งบูธ / ใบปลิว / ตัวอย่างสินค้า
export interface HallUsagePurpose {
  id: number;
  name: string;
  description: string;
  pricing_model: HallPricingModel;
  default_price: number; // ค่าตั้งต้น/fallback เมื่ออาคารยังไม่ตั้งราคา
  is_active: boolean;
  sort_order: number;
}

// ราคาของอาคารต่อ 1 วัตถุประสงค์ (มาจาก GET /buildings)
export interface BuildingHallPricing {
  hall_usage_purpose_id: number;
  purpose_name: string;
  pricing_model: HallPricingModel;
  price: number; // per_sqm: บาท/ตร.ม./วัน ; per_type_per_day: บาท/ประเภท/วัน
  is_active: boolean;
}

export interface BuildingWithPricing {
  id: number;
  name: string;
  hall_pricings?: BuildingHallPricing[];
}

// ราคาของโถงหนึ่ง 1 วัตถุประสงค์ (มาจาก GET /locations/:id/hall-pricings)
// โถงทำเลทองตั้งราคาสูงกว่าเรทกลางของอาคารได้ แต่ราคาอาคารเป็นขั้นต่ำเสมอ
export interface HallPricingRow {
  hall_usage_purpose_id: number;
  purpose_name: string;
  pricing_model: HallPricingModel;
  building_price: number; // ราคาอาคาร = ขั้นต่ำ
  override_price: number | null; // ราคาเฉพาะโถง ; null = ไม่ได้ตั้ง
  effective_price: number; // ราคาที่ใช้จริง = max(building, override)
  is_active: boolean; // อาคารเปิดให้ขอวัตถุประสงค์นี้หรือไม่
}

// payload สำหรับ PUT /locations/:id/hall-pricings — price null = ล้าง override กลับไปใช้ราคาอาคาร
export interface UpdateHallPricingInput {
  hall_usage_purpose_id: number;
  price: number | null;
}

// payload สำหรับ PUT /buildings/:id/hall-pricings
export interface UpdateBuildingHallPricingInput {
  hall_usage_purpose_id: number;
  price: number;
  is_active: boolean;
}

// payload สำหรับ POST /hall-usage-purposes (เพิ่มวัตถุประสงค์ใหม่)
export interface CreateHallPurposeInput {
  name: string;
  description: string;
  pricing_model: HallPricingModel;
  default_price: number;
}

// payload สำหรับ PUT /hall-usage-purposes/:id (แก้ pricing_model ไม่ได้)
export interface UpdateHallPurposeInput {
  name?: string;
  description?: string;
  default_price?: number;
  is_active?: boolean;
  sort_order?: number;
}
