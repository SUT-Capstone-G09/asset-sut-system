export type CellType = "empty" | "wall" | "walkway" | "stall";

export type StallStatus = "vacant" | "occupied" | "inactive";

export interface FloorPlanStall {
  id: string;
  label: string;           // เช่น "A01", "B03"
  name?: string;           // ชื่อร้าน เช่น "ร้านก๋วยเตี๋ยว"
  status: StallStatus;
  cells: [number, number][]; // รายการเซลล์ที่เป็นของ stall นี้ [row, col]
  color?: string;           // สีพื้นหลัง (optional, ใช้ค่าเริ่มต้นตาม status)
}

export interface FloorPlanData {
  id: string;
  locationId: string;       // ผูกกับ Location ID (เช่น "1" = โรงอาหารพราวแสดทอง)
  name: string;
  rows: number;
  cols: number;
  grid: CellType[][];       // matrix ของ cell types (rows x cols)
  stalls: FloorPlanStall[];
  updatedAt: string;
}
