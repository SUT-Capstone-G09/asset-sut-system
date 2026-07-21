export type BookingMode = "single" | "range";
export type SortOption = "price_asc" | "price_desc" | "capacity";
export type ViewMode = "grid" | "list";

export type RoomBadge = "ยอดนิยม" | "ใหม่" | "Premium";
export type AvailabilityStatus = "ว่างทุกวัน" | "ว่างบางวัน";

export interface Room {
  id: string;
  name: string;
  building: string;
  floor?: string;
  capacityMin: number;
  capacityMax: number;
  pricePerHour: number;
  pricePerHourOffPeak?: number;
  pricePerDay?: number;
  amenities: string[];
  image: string;
  badge?: RoomBadge;
  availability: AvailabilityStatus;
  type?: string; // ประเภทสถานที่ (เช่น "โถงอาคาร") — ใช้แยก flow การจองโถง
  buildingId?: number; // อาคารของสถานที่ (FK) — ใช้กับราคา/ผังโถง
}

export interface RoomSearchParams {
  mode: BookingMode;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string | undefined;
  endTime: string | undefined;
  capacity: number | undefined;
}
