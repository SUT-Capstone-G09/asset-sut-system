import * as z from "zod";

export const areaSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อพื้นที่เช่า"),
  areaCode: z.string().min(1, "กรุณาระบุรหัสพื้นที่ (Area Code)"),
  building: z.string().min(1, "กรุณาเลือกอาคาร"),
  area: z.string().min(1, "กรุณาเลือกพื้นที่หลัก"),
  size: z.string().optional(),
  price: z.union([
    z.coerce.number({ message: "กรุณาระบุเป็นตัวเลข" }).min(0, "ราคาต้องไม่ต่ำกว่า 0"),
    z.literal("").transform(() => undefined),
    z.undefined()
  ]).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type AreaFormValues = z.infer<typeof areaSchema>;
