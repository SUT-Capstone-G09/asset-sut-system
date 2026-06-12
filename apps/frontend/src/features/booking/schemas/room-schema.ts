import * as z from "zod";

export const roomSchema = z.object({
  roomName: z.string().min(1, "กรุณาระบุชื่อห้อง"),
  roomNumber: z.string().optional().default(""),
  building: z.string().min(1, "กรุณาระบุอาคาร"),
  category: z.string().min(1, "กรุณาเลือกประเภทห้อง"),
  capacity: z.coerce.number().min(1, "จำนวนความจุต้องมากกว่า 0"),
  image: z.string().min(1, "กรุณาอัปโหลดรูปภาพ"),
  status: z.enum(["available", "maintenance"]),
  equipment: z.array(z.string()).default([]),
  notes: z.string().optional(),
  rates: z.object({
    hourlyInternal: z.coerce.number().min(1, "กรุณากำหนดอัตราค่าใช้จ่ายรายชั่วโมง (ภายใน)"),
    hourlyExternal: z.coerce.number().min(1, "กรุณากำหนดอัตราค่าใช้จ่ายรายชั่วโมง (ภายนอก)"),
    dailyInternal: z.coerce.number().min(1, "กรุณากำหนดอัตราค่าใช้จ่ายรายวัน (ภายใน)"),
    dailyExternal: z.coerce.number().min(1, "กรุณากำหนดอัตราค่าใช้จ่ายรายวัน (ภายนอก)"),
  }),
  documents: z.array(z.string()).default([]),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
