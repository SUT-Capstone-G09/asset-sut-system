import * as z from "zod";

export const bookingSchema = z.object({
  roomName: z.string().min(1, "กรุณาระบุชื่อห้อง"),
  roomNumber: z.string().min(1, "กรุณาระบุรหัสห้อง"),
  building: z.string().min(1, "กรุณาระบุอาคาร"),
  category: z.string().min(1, "กรุณาเลือกประเภทพื้นที่"),
  requesterName: z.string().min(1, "กรุณาระบุชื่อผู้ขอใช้พื้นที่"),
  requesterId: z.string().min(1, "กรุณาระบุรหัสประจำตัวผู้ขอ"),
  requesterType: z.enum(["student", "staff", "external"]),
  purpose: z.string().min(1, "กรุณาระบุวัตถุประสงค์การใช้งาน"),
  date: z.string().min(1, "กรุณาเลือกวันที่"),
  timeSlot: z.string().min(1, "กรุณาเลือกช่วงเวลา"),
  attendees: z.coerce.number().min(1, "จำนวนผู้เข้าร่วมต้องมากกว่า 0"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  notes: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(["pending", "pending_payment", "verifying_payment", "approved", "rejected"]).optional(),
  equipment: z.array(z.string()).optional(),
  expenses: z.array(
    z.object({
      name: z.string(),
      amount: z.coerce.number()
    })
  ).optional(),
  attachedDocuments: z.array(z.string()).optional(),
  receiptImage: z.string().optional(),
  housekeeperPrice: z.coerce.number().min(0, "ราคาค่าแม่บ้านต้องไม่ต่ำกว่า 0").optional(),
  housekeeperCount: z.coerce.number().min(0, "จำนวนคนต้องไม่ต่ำกว่า 0").optional()
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
