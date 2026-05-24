import * as z from "zod";

export const roomSchema = z.object({
  roomName: z.string().min(1, "กรุณาระบุชื่อห้อง"),
  roomNumber: z.string().min(1, "กรุณาระบุรหัสห้อง"),
  building: z.string().min(1, "กรุณาระบุอาคาร"),
  category: z.string().min(1, "กรุณาเลือกประเภทห้อง"),
  capacity: z.coerce.number().min(1, "จำนวนความจุต้องมากกว่า 0"),
  image: z.string().min(1, "กรุณาใส่ลิงก์รูปภาพ"),
  status: z.enum(["available", "maintenance"]),
  equipment: z.array(z.string()).default([]),
  notes: z.string().optional(),
  rates: z.object({
    hourlyInternal: z.coerce.number().min(0, "อัตราค่าใช้จ่ายต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
    hourlyExternal: z.coerce.number().min(0, "อัตราค่าใช้จ่ายต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
    dailyInternal: z.coerce.number().min(0, "อัตราค่าใช้จ่ายต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
    dailyExternal: z.coerce.number().min(0, "อัตราค่าใช้จ่ายต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0"),
  }),
  documents: z.array(z.string()).default([]),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
