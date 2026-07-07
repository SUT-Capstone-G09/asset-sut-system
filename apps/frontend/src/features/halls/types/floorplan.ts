// สัดส่วน 0..1 เทียบกับรูปผัง top-view — บอกว่ากริดวางทับสี่เหลี่ยมไหนของรูป
export interface Overlay {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ผังพื้นที่ของโถง (เก็บใน localStorage เฟสนี้)
export interface HallFloorPlan {
  hallId: string;
  topViewImageUrl: string; // รูปผัง top-view (dataURL) สำหรับตั้งสเกล
  imageNaturalW: number;
  imageNaturalH: number;
  gridCols: number;
  gridRows: number;
  cellSizeM: number; // ขนาดช่อง (เมตร) เช่น 1 = 1x1 ตร.ม.
  realWidthM?: number; // ความกว้างจริงของพื้นที่ (เมตร) — ใช้คำนวณจำนวนคอลัมน์
  realLengthM?: number; // ความยาวจริงของพื้นที่ (เมตร) — ใช้คำนวณจำนวนแถว
  overlay: Overlay;
  pxPerMX?: number; // pixel ต่อเมตร แกนกว้าง (จากการตั้งสเกล)
  pxPerMY?: number; // pixel ต่อเมตร แกนยาว
  blockedCells: [number, number][]; // ช่องห้ามจอง [row, col]
  updatedAt: string;
}

export function createEmptyFloorPlan(hallId: string): HallFloorPlan {
  return {
    hallId,
    topViewImageUrl: "",
    imageNaturalW: 0,
    imageNaturalH: 0,
    gridCols: 10,
    gridRows: 8,
    cellSizeM: 1,
    overlay: { x: 0, y: 0, w: 1, h: 1 },
    blockedCells: [],
    updatedAt: new Date().toISOString(),
  };
}
