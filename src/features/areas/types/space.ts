export type SpaceStatus = "available" | "occupied" | "reserved";

export interface StoreSpace {
  id: string;
  locationId: string;
  name: string;
  status: SpaceStatus;
  price: number;

  // ข้อมูลสำหรับวาด Konva Canvas
  x: number;
  y: number;
  width: number;
  height: number;
}