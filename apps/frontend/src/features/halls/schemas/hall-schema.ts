import * as z from "zod";

// โถงไม่มีฟิลด์ความจุ (capacity) — ต่างจากห้อง
// ราคาไม่ได้ตั้งที่โถง แต่ตั้งราย "อาคาร × วัตถุประสงค์" ในหน้า "ตั้งราคาการขอใช้พื้นที่โถง"
export const hallSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อโถงพื้นที่"),
  building: z.string().min(1, "กรุณาระบุอาคาร"),
  image: z.string().min(1, "กรุณาอัปโหลดรูปพื้นที่จริง"),
  status: z.enum(["available", "maintenance"]),
  notes: z.string().optional(),
});

export type HallFormValues = z.infer<typeof hallSchema>;
