export interface Expense {
  id: string;
  itemName: string;
  subtext: string;
  category: string;
  pricePerUnit: number;
}

export const mockExpenses: Expense[] = [
  {
    id: "EXP-001",
    itemName: "แม่บ้าน",
    subtext: "Asset ID: VCH-2930",
    category: "MAINTENANCE",
    pricePerUnit: 450.00
  },
  {
    id: "EXP-002",
    itemName: "ค่าไฟ",
    subtext: "Facility: Zone A Storage",
    category: "MAINTENANCE",
    pricePerUnit: 300.00
  },
  {
    id: "EXP-003",
    itemName: "ค่าเก็บขยะ",
    subtext: "Dept: Supply Chain",
    category: "MAINTENANCE",
    pricePerUnit: 100.00
  },
  {
    id: "EXP-004",
    itemName: "อินเทอร์เน็ต",
    subtext: "Facility: Zone B Lab",
    category: "UTILITIES",
    pricePerUnit: 599.00
  },
  {
    id: "EXP-005",
    itemName: "ค่าน้ำประปา",
    subtext: "Asset ID: BLD-002",
    category: "UTILITIES",
    pricePerUnit: 150.00
  },
  {
    id: "EXP-006",
    itemName: "ซ่อมแซมเครื่องปรับอากาศ",
    subtext: "Asset ID: B1205",
    category: "MAINTENANCE",
    pricePerUnit: 1200.00
  },
  {
    id: "EXP-007",
    itemName: "พนักงานต้อนรับ",
    subtext: "Dept: Concierge",
    category: "OPERATIONAL",
    pricePerUnit: 350.00
  },
  {
    id: "EXP-008",
    itemName: "พนักงานรักษาความปลอดภัย",
    subtext: "Asset ID: GATE-1",
    category: "SECURITY",
    pricePerUnit: 500.00
  },
  {
    id: "EXP-009",
    itemName: "กระดาษชำระและสบู่เหลว",
    subtext: "Facility: Main Restrooms",
    category: "SUPPLIES",
    pricePerUnit: 80.00
  },
  {
    id: "EXP-010",
    itemName: "ตรวจเช็คถังดับเพลิง",
    subtext: "Asset ID: FIRE-SYS",
    category: "SECURITY",
    pricePerUnit: 250.00
  },
  {
    id: "EXP-011",
    itemName: "บำรุงรักษาลิฟต์โดยสาร",
    subtext: "Asset ID: ELEV-01",
    category: "MAINTENANCE",
    pricePerUnit: 2500.00
  },
  {
    id: "EXP-012",
    itemName: "น้ำดื่มและเครื่องดื่มบริการ",
    subtext: "Facility: Meeting Room A",
    category: "SUPPLIES",
    pricePerUnit: 120.00
  }
];
