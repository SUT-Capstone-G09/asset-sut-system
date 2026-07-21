// โถงพื้นที่ = location ประเภท "โถงอาคาร" — โครงใกล้เคียง Room แต่ไม่มี capacity
// รูปในนี้คือ "รูปพื้นที่จริง" (ถ่ายจากกล้อง) ส่วนรูปผัง top-view สำหรับตั้งสเกลอยู่ใน floorplan config แยก
// ราคาไม่ผูกกับโถง — ตั้งราย "อาคาร × วัตถุประสงค์" (ดู features/halls/types/pricing.ts)
export interface Hall {
  id: string;
  name: string;
  // ชื่ออาคาร — resolve เป็น building_id ตอนบันทึกใน useHalls (ชื่ออาคาร unique ใน DB)
  building: string;
  category: string; // ล็อกเป็น "โถงอาคาร"
  image: string; // รูปพื้นที่จริง
  status: "available" | "maintenance";
  notes?: string;
  hasFloorPlan?: boolean;
}
