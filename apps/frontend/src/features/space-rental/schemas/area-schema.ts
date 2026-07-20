import * as z from "zod";

export const areaSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อพื้นที่เช่า"),
  areaCode: z.string().min(1, "กรุณาระบุรหัสพื้นที่ (Area Code)"),
  building: z.string().min(1, "กรุณาเลือกอาคาร"),
  area: z.string().min(1, "กรุณาเลือกพื้นที่หลัก"),
  size: z.string().optional(),
  price: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().optional()
  ).optional() as z.ZodType<number | undefined, any, any>,
  description: z.string().optional(),
  image: z.string().optional(),
});

export type AreaFormValues = z.infer<typeof areaSchema>;
