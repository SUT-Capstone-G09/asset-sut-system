import * as z from "zod";

export const buildingSchema = z.object({
  name: z
    .string()
    .min(2, "ชื่ออาคารต้องมีความยาวอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่ออาคารต้องมีความยาวไม่เกิน 100 ตัวอักษร")
    .trim(),
  building_type_name: z
    .string()
    .optional(),
  description: z
    .string()
    .max(500, "รายละเอียดเพิ่มเติมต้องไม่เกิน 500 ตัวอักษร")
    .optional(),
});

export type BuildingFormValues = z.infer<typeof buildingSchema>;