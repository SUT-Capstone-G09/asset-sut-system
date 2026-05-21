import { FloorPlanData, CellType } from "@/features/areas/types/floor-plan";

/**
 * ข้อมูลจำลองผังร้านค้า "โรงอาหารพราวแสดทอง"
 * ตาราง 10 แถว x 14 คอลัมน์
 */

const ROWS = 10;
const COLS = 14;

// สร้าง grid ว่างเปล่า
function createEmptyGrid(rows: number, cols: number): CellType[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): CellType => "empty")
  );
}

function generateCanteenGrid(): CellType[][] {
  const g = createEmptyGrid(ROWS, COLS);
  
  // วาดกำแพงขอบ (แถวบนสุด, แถวล่างสุด, คอลัมน์ซ้าย, คอลัมน์ขวา)
  for (let c = 0; c < COLS; c++) {
    g[0][c] = "wall";
    g[ROWS - 1][c] = "wall";
  }
  for (let r = 0; r < ROWS; r++) {
    g[r][0] = "wall";
    g[r][COLS - 1] = "wall";
  }

  // ทางเดินกลาง (แถว 5)
  for (let c = 1; c < COLS - 1; c++) {
    g[4][c] = "walkway";
    g[5][c] = "walkway";
  }

  // ทางเดินแนวตั้ง (คอลัมน์ 7)
  for (let r = 1; r < ROWS - 1; r++) {
    g[r][7] = "walkway";
  }

  // เติม stall cells — ฝั่งบน ซ้าย
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) g[r][c] = "stall";
    for (let c = 4; c <= 6; c++) g[r][c] = "stall";
    for (let c = 8; c <= 10; c++) g[r][c] = "stall";
    for (let c = 11; c <= 12; c++) g[r][c] = "stall";
  }

  // เติม stall cells — ฝั่งล่าง
  for (let r = 6; r <= 8; r++) {
    for (let c = 1; c <= 3; c++) g[r][c] = "stall";
    for (let c = 4; c <= 6; c++) g[r][c] = "stall";
    for (let c = 8; c <= 10; c++) g[r][c] = "stall";
    for (let c = 11; c <= 12; c++) g[r][c] = "stall";
  }
  
  return g;
}

function cellRange(rowStart: number, rowEnd: number, colStart: number, colEnd: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = rowStart; r <= rowEnd; r++) {
    for (let c = colStart; c <= colEnd; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

export const mockFloorPlans: FloorPlanData[] = [
  {
    id: "fp-1",
    locationId: "1",
    name: "ผังโรงอาหารพราวแสดทอง",
    rows: ROWS,
    cols: COLS,
    grid: generateCanteenGrid(),
    stalls: [
      // ฝั่งบน
      { id: "s1", label: "A01", name: "ร้านก๋วยเตี๋ยวเรือ",    status: "occupied", cells: cellRange(1, 3, 1, 3) },
      { id: "s2", label: "A02", name: "ร้านส้มตำจัดจ้าน",     status: "occupied", cells: cellRange(1, 3, 4, 6) },
      { id: "s3", label: "A03", name: "ร้านข้าวแกง",          status: "vacant",   cells: cellRange(1, 3, 8, 10) },
      { id: "s4", label: "A04", name: "",                     status: "vacant",   cells: cellRange(1, 3, 11, 12) },

      // ฝั่งล่าง
      { id: "s5", label: "B01", name: "ร้านชาบู & สุกี้",     status: "occupied", cells: cellRange(6, 8, 1, 3) },
      { id: "s6", label: "B02", name: "",                     status: "inactive", cells: cellRange(6, 8, 4, 6) },
      { id: "s7", label: "B03", name: "ร้านเครื่องดื่ม & น้ำผลไม้", status: "occupied", cells: cellRange(6, 8, 8, 10) },
      { id: "s8", label: "B04", name: "ร้านขนมหวาน",          status: "occupied", cells: cellRange(6, 8, 11, 12) },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fp-2",
    locationId: "2",
    name: "ผังโรงอาหารกาสะลองคำ",
    rows: ROWS,
    cols: COLS,
    grid: generateCanteenGrid(),
    stalls: [
      // ฝั่งบน
      { id: "k1", label: "A01", name: "ร้านก๋วยเตี๋ยวเรือกาสะลอง", status: "occupied", cells: cellRange(1, 3, 1, 3) },
      { id: "k2", label: "A02", name: "ร้านส้มตำแซ่บเวอร์",     status: "occupied", cells: cellRange(1, 3, 4, 6) },
      { id: "k3", label: "A03", name: "ร้านข้าวราดแกงเมืองเลย",  status: "vacant",   cells: cellRange(1, 3, 8, 10) },
      { id: "k4", label: "A04", name: "",                     status: "vacant",   cells: cellRange(1, 3, 11, 12) },

      // ฝั่งล่าง
      { id: "k5", label: "B01", name: "ร้านชาบูอินดี้",        status: "occupied", cells: cellRange(6, 8, 1, 3) },
      { id: "k6", label: "B02", name: "",                     status: "inactive", cells: cellRange(6, 8, 4, 6) },
      { id: "k7", label: "B03", name: "ร้านน้ำผลไม้ปั่น",       status: "occupied", cells: cellRange(6, 8, 8, 10) },
      { id: "k8", label: "B04", name: "ร้านบัวลอยนมสด",        status: "occupied", cells: cellRange(6, 8, 11, 12) },
    ],
    updatedAt: new Date().toISOString(),
  },
];
