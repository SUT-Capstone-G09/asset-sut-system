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
  address: z
    .string()
    .max(255, "ที่อยู่ต้องไม่เกิน 255 ตัวอักษร")
    .optional(),
  floor_count: z.coerce.number().min(1, "จำนวนชั้นต้องไม่ต่ำกว่า 1 ชั้น").nullable().optional() as z.ZodType<number | null | undefined, any, any>,
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  description: z
    .string()
    .max(500, "รายละเอียดเพิ่มเติมต้องไม่เกิน 500 ตัวอักษร")
    .optional(),
  has_floor_plan: z.boolean().optional(),
  floor_plan_type: z.enum(["image", "canvas"]).optional(),
  blueprint_url: z.string().optional(),
});

export type BuildingFormValues = z.infer<typeof buildingSchema>;
