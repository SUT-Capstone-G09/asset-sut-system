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
