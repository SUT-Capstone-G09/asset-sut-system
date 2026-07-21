import { apiClient } from "@/lib/services/api-client";
import { HallFloorPlan } from "../types/floorplan";

// รูปร่าง response จาก backend (snake_case)
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

// GET ผังของโถง — คืน null ถ้ายังไม่มี
export async function getHallFloorPlan(hallId: string): Promise<HallFloorPlan | null> {
  const dto = await apiClient.get<HallFloorPlanDTO | null>(`/locations/${hallId}/floor-plan`);
  return dto ? fromDTO(hallId, dto) : null;
}

// PUT บันทึกผัง — topViewImageKey = object_key ของรูปที่เพิ่งอัปโหลด (ถ้าไม่มี ส่ง URL เดิม backend จะคงรูปไว้)
export async function saveHallFloorPlan(
  hallId: string,
  fp: HallFloorPlan,
  topViewImageKey?: string
): Promise<HallFloorPlan> {
  const payload = {
    top_view_image: topViewImageKey ?? fp.topViewImageUrl,
    image_natural_w: fp.imageNaturalW,
    image_natural_h: fp.imageNaturalH,
    grid_cols: fp.gridCols,
    grid_rows: fp.gridRows,
    cell_size_m: fp.cellSizeM,
    real_width_m: fp.realWidthM ?? null,
    real_length_m: fp.realLengthM ?? null,
    overlay: fp.overlay,
    px_per_mx: fp.pxPerMX ?? null,
    px_per_my: fp.pxPerMY ?? null,
    blocked_cells: fp.blockedCells,
  };
  const dto = await apiClient.put<HallFloorPlanDTO>(`/locations/${hallId}/floor-plan`, payload);
  return fromDTO(hallId, dto);
}

// อัปโหลดรูปผัง (top-view) ของโถง — backend เก็บที่ path มาตรฐาน
// "รูปภาพสถานที่/{ชื่ออาคาร}/โถงอาคาร/แผนผัง/{ชื่อโถง}" (ดึงชื่ออาคาร/โถงจาก DB) แล้วคืน object_key + url
export async function uploadHallFloorPlanImage(
  hallId: string,
  file: File
): Promise<{ object_key: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.upload<{ object_key: string; url: string }>(
    `/locations/${hallId}/floor-plan/image`,
    formData
  );
}

// เซ็ตของ hallId ที่มีผังแล้ว (ใช้โชว์ป้าย "มีผัง")
export async function getFloorPlanHallIds(): Promise<Set<string>> {
  const ids = await apiClient.get<number[]>("/hall-floor-plans");
  return new Set((ids ?? []).map(String));
}
