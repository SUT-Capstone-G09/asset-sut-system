import { apiClient } from "@/lib/services/api-client";
import { HallFloorPlan } from "@/features/halls/types/floorplan";

// รูปร่าง response ผังโถงจาก backend (snake_case) — เหมือน endpoint ฝั่ง admin แต่ public
interface HallFloorPlanDTO {
  location_id: number;
  top_view_image_url: string | null;
  image_natural_w: number;
  image_natural_h: number;
  grid_cols: number;
  grid_rows: number;
  cell_size_m: number;
  real_width_m: number | null;
  real_length_m: number | null;
  overlay: { x: number; y: number; w: number; h: number };
  px_per_mx: number | null;
  px_per_my: number | null;
  blocked_cells: [number, number][] | null;
}

function fromDTO(hallId: string, d: HallFloorPlanDTO): HallFloorPlan {
  return {
    hallId,
    topViewImageUrl: d.top_view_image_url ?? "",
    imageNaturalW: d.image_natural_w,
    imageNaturalH: d.image_natural_h,
    gridCols: d.grid_cols,
    gridRows: d.grid_rows,
    cellSizeM: d.cell_size_m,
    realWidthM: d.real_width_m ?? undefined,
    realLengthM: d.real_length_m ?? undefined,
    overlay: d.overlay,
    pxPerMX: d.px_per_mx ?? undefined,
    pxPerMY: d.px_per_my ?? undefined,
    blockedCells: d.blocked_cells ?? [],
    updatedAt: new Date().toISOString(),
  };
}

// ผังโถงสำหรับหน้าจอง (public) — คืน null ถ้าโถงยังไม่มีผัง
export async function getPublicHallFloorPlan(
  locationId: number | string
): Promise<HallFloorPlan | null> {
  const dto = await apiClient.get<HallFloorPlanDTO | null>(
    `/locations/${locationId}/public-floor-plan`
  );
  return dto ? fromDTO(String(locationId), dto) : null;
}

// เซลล์บูธที่ถูกจองแล้ว (union ของ active bookings) ตามวันที่เลือก — ใช้ปิดเซลล์บนผัง
export async function getBookedCells(
  locationId: number | string,
  dates: string[]
): Promise<[number, number][]> {
  if (dates.length === 0) return [];
  const q = encodeURIComponent(dates.join(","));
  const cells = await apiClient.get<[number, number][] | null>(
    `/locations/${locationId}/booked-cells?dates=${q}`
  );
  return cells ?? [];
}

// ── ราคาที่ระบบคำนวณ (preview ก่อนสร้าง booking) ──
export interface HallPurposeQuoteInput {
  hall_usage_purpose_id: number;
  selected_cells?: number[][]; // per_sqm
  product_type_count?: number; // per_type_per_day
}
export interface HallPurposeQuote {
  hall_usage_purpose_id: number;
  pricing_model: string;
  area_sqm?: number;
  product_type_count?: number;
  unit_price: number;
  computed_price: number; // เกณฑ์ขั้นต่ำที่ราคาเสนอห้ามต่ำกว่า
}
export interface HallPriceQuote {
  days: number;
  purposes: HallPurposeQuote[];
  total_computed: number;
}

// ให้ backend คำนวณราคาที่ระบบคิดสำหรับวัตถุประสงค์ที่เลือก (ตามจำนวนวัน) — ไม่ตรวจราคาเสนอ
export async function getHallPriceQuote(
  locationId: number | string,
  days: number,
  purposes: HallPurposeQuoteInput[]
): Promise<HallPriceQuote> {
  return apiClient.post<HallPriceQuote>(
    `/locations/${locationId}/hall-price-quote`,
    { days, purposes }
  );
}
