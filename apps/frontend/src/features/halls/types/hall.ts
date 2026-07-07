export interface HallRates {
  hourlyInternal: number;
  hourlyExternal: number;
  dailyInternal: number;
  dailyExternal: number;
}

// โถงพื้นที่ = location ประเภท "โถงอาคาร" — โครงใกล้เคียง Room แต่ไม่มี capacity
// รูปในนี้คือ "รูปพื้นที่จริง" (ถ่ายจากกล้อง) ส่วนรูปผัง top-view สำหรับตั้งสเกลอยู่ใน floorplan config แยก
export interface Hall {
  id: string;
  name: string;
  buildingId?: string;
  building: string;
  category: string; // ล็อกเป็น "โถงอาคาร"
  image: string; // รูปพื้นที่จริง
  status: "available" | "maintenance";
  notes?: string;
  rates: HallRates;
  hasFloorPlan?: boolean;
}
