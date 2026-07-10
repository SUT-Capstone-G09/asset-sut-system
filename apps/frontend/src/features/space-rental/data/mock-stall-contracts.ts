import { StallContract } from "../types/stall-contract";

// ข้อมูลจำลองสัญญาของแผงย่อยสำหรับโรงอาหาร
export const mockStallContracts: Record<string, StallContract> = {
  "01": {
    tenantName: "ร้านก๋วยเตี๋ยวเรือแสนดี",
    ownerName: "นางสมศรี รสดี",
    phone: "081-234-5678",
    category: "ก๋วยเตี๋ยว / อาหารเส้น",
    contractNumber: "CON-ST-101",
    price: 5000,
    endDate: "31 ธ.ค. 2569",
  },
  "02": {
    tenantName: "ร้านส้มตำจัดจ้าน",
    ownerName: "นายมานะ มีโชค",
    phone: "089-876-5432",
    category: "อาหารอีสาน / ส้มตำ",
    contractNumber: "CON-ST-102",
    price: 5000,
    endDate: "30 พ.ย. 2569",
  },
  "03": {
    tenantName: "ร้านชาบู & สุกี้โบราณ",
    ownerName: "บริษัท ชาบูกรู๊ป จำกัด (ผู้แทน)",
    phone: "02-123-4567",
    category: "สุกี้ / ชาบูปิ้งย่าง",
    contractNumber: "CON-ST-103",
    price: 7500,
    endDate: "31 ต.ค. 2569",
  },
  "04": {
    tenantName: "ร้านเครื่องดื่ม & น้ำผลไม้คั้นสด",
    ownerName: "น.ส.วิภาดา ชื่นใจ",
    phone: "085-555-6789",
    category: "เครื่องดื่ม / เบเกอรี่",
    contractNumber: "CON-ST-104",
    price: 4500,
    endDate: "31 ส.ค. 2569",
  },
  "05": {
    tenantName: "ร้านขนมหวานสไตล์ไทย",
    ownerName: "นายกิตติคุณ อิ่มอร่อย",
    phone: "086-444-1234",
    category: "ของหวาน / ไอศกรีม",
    contractNumber: "CON-ST-105",
    price: 4500,
    endDate: "31 ธ.ค. 2569",
  },
};
