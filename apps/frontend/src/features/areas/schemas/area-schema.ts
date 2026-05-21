import * as z from "zod";

export const areaSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อสถานที่ หรือรหัสพื้นที่"),
  building: z.string().min(1, "กรุณาเลือกอาคาร"),
  category: z.string().min(1, "กรุณาเลือกประเภทพื้นที่"),
  size: z.string().min(1, "กรุณาระบุขนาดพื้นที่"),
  price: z.union([
    z.coerce.number({ message: "กรุณาระบุเป็นตัวเลข" }).min(0, "ราคาต้องไม่ต่ำกว่า 0"),
    z.literal("").transform(() => undefined),
    z.undefined()
  ]).optional(),
  description: z.string().optional(),
  tenantName: z.string().optional(),
  contractEndDate: z.string().optional(),
  contractName: z.string().optional(),
  citizenId: z.string().optional(),
  contractNumber: z.string().optional(),
  image: z.string().optional(),
});

export type AreaFormValues = z.infer<typeof areaSchema>;
