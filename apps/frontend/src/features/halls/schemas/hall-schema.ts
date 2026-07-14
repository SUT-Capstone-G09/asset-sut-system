import * as z from "zod";

// โถงไม่มีฟิลด์ความจุ (capacity) — ต่างจากห้อง
// ราคาไม่บังคับ (สูตรคำนวณต่างตามประเภทคำขอ — ยังไม่ implement เฟสนี้)
export const hallSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อโถงพื้นที่"),
  buildingId: z.string().min(1, "กรุณาระบุอาคาร"),
  image: z.string().min(1, "กรุณาอัปโหลดรูปพื้นที่จริง"),
  status: z.enum(["available", "maintenance"]),
  notes: z.string().optional(),
  rates: z.object({
    hourlyInternal: z.coerce.number().min(0),
    hourlyExternal: z.coerce.number().min(0),
    hourlyOffPeakInternal: z.coerce.number().optional(),
    hourlyOffPeakExternal: z.coerce.number().optional(),
    dailyInternal: z.coerce.number().min(0),
    dailyExternal: z.coerce.number().min(0),
  }),
});

export type HallFormValues = z.infer<typeof hallSchema>;
