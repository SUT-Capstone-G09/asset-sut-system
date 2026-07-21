import * as z from "zod";

// โถงไม่มีฟิลด์ความจุ (capacity) — ต่างจากห้อง
// เรทกลาง/ขั้นต่ำตั้งราย "อาคาร × วัตถุประสงค์" ในหน้า "ตั้งราคาการขอใช้พื้นที่โถง"
// ส่วน pricings คือราคาเฉพาะโถงนี้ (ทำเลทอง) ที่สูงกว่าเรทอาคารได้ — มีเฉพาะหน้าแก้ไข
// ขั้นต่ำ validate ที่ HallPricingFields (zod ไม่เห็นราคาอาคาร) และที่ backend ซึ่งเป็น authority
export const hallSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อโถงพื้นที่"),
  building: z.string().min(1, "กรุณาระบุอาคาร"),
  image: z.string().min(1, "กรุณาอัปโหลดรูปพื้นที่จริง"),
  status: z.enum(["available", "maintenance"]),
  notes: z.string().optional(),
  pricings: z
    .array(
      z.object({
        hall_usage_purpose_id: z.number(),
        price: z.number().nullable(), // null = ใช้ราคาอาคาร
      }),
    )
    .optional(),
});

export type HallFormValues = z.infer<typeof hallSchema>;
