import { apiClient } from "@/lib/services/api-client";
import { AvailabilityStatus, Room } from "@/features/bookings/types";

export interface LocationDTO {
  id: number;
  parent_id?: number;
  type_id: number;
  type: string;
  name: string;
  building_id?: number;
  building?: string;
  image_url?: string;
  room_number?: number;
  floor_number?: number;
  capacity: number;
  status_id: number;
  status: string;
  pricing_tiers?: { id: number; price: number; requester_type: string; rate_type: string }[];
}

export interface AddonDTO {
  id: number;
  location_id: number;
  name: string;
  description: string;
  default_price: number;
  charge_type_id: number;
  charge_type: string;
  quantity: number;
  is_active: boolean;
}

export interface PricingTierDTO {
  id: number;
  location_id: number;
  requester_type_id: number;
  requester_type: string;
  rate_type_id: number;
  rate_type: string;
  price: number;
}

export interface LocationDetailDTO extends LocationDTO {
  building?: string;
  equipments: { id: number; equipment_id: number; name: string; quantity: number }[];
  addons: AddonDTO[];
  pricing_tiers: PricingTierDTO[];
}

export interface DayAvailability {
  status: "available" | "partial" | "full";
  booked_hours?: number;
  booked_ranges?: [string, string][]; // e.g. [["09:00","11:00"]]
}

export type MonthlyAvailabilityMap = Record<string, DayAvailability>;

export async function getLocations(): Promise<LocationDTO[]> {
  return apiClient.get<LocationDTO[]>("/locations");
}

export interface LocationTypeDTO {
  id: number;
  type: string;
}

export async function getLocationTypes(): Promise<LocationTypeDTO[]> {
  return apiClient.get<LocationTypeDTO[]>("/location-types");
}

export interface BuildingDTO {
  id: number;
  name: string;
  code?: string;
}

export async function getBuildings(): Promise<BuildingDTO[]> {
  return apiClient.get<BuildingDTO[]>("/buildings");
}

export async function getLocationById(id: number): Promise<LocationDetailDTO> {
  return apiClient.get<LocationDetailDTO>(`/locations/${id}`);
}

export async function getMonthlyAvailability(
  locationId: number,
  year: number,
  month: number
): Promise<MonthlyAvailabilityMap> {
  return apiClient.get<MonthlyAvailabilityMap>(
    `/locations/${locationId}/monthly-availability?year=${year}&month=${month}`
  );
}

// Real (booking-derived) availability badge for the current month, from today
// onward — replaces the old "loc.status === available" heuristic, which only
// reflects whether the room is in service, not whether it's actually booked.
export async function getRoomAvailabilityBadge(locationId: number): Promise<AvailabilityStatus> {
  const now = new Date();
  const map = await getMonthlyAvailability(locationId, now.getFullYear(), now.getMonth() + 1);
  const todayStr = now.toISOString().slice(0, 10);
  const hasBookedDay = Object.entries(map).some(
    ([dateStr, day]) => dateStr >= todayStr && day.status !== "available"
  );
  return hasBookedDay ? "ว่างบางวัน" : "ว่างทุกวัน";
}

// Checks whether a room is free for every date in `dates` (each "yyyy-MM-dd").
// A "full" day always blocks. A "partial" day only blocks when it overlaps
// the requested [startTime, endTime) — if no time was given, partial days are
// treated as available since some free time exists (the room's own calendar
// lets the user pick around it).
export async function isRoomAvailableForRequest(
  locationId: number,
  dates: string[],
  startTime?: string,
  endTime?: string
): Promise<boolean> {
  if (dates.length === 0) return true;

  const months = Array.from(new Set(dates.map((d) => d.slice(0, 7))));
  const mapEntries = await Promise.all(
    months.map(async (ym): Promise<[string, MonthlyAvailabilityMap]> => {
      const [year, month] = ym.split("-").map(Number);
      return [ym, await getMonthlyAvailability(locationId, year, month)];
    })
  );
  const mapByMonth = new Map(mapEntries);

  return dates.every((dateStr) => {
    const day = mapByMonth.get(dateStr.slice(0, 7))?.[dateStr];
    if (!day || day.status === "available") return true;
    if (day.status === "full") return false;
    if (!startTime || !endTime) return true;
    return !(day.booked_ranges ?? []).some(([rs, re]) => startTime < re && endTime > rs);
  });
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

function pickHourlyPrice(tiers: LocationDTO["pricing_tiers"], requesterTypeId?: number): number {
  const isExternal = requesterTypeId === 2;
  const typeKeyword = isExternal ? "ภายนอก" : "ภายใน";
  return (
    tiers?.find((t) => t.requester_type?.includes(typeKeyword) && t.rate_type === "hourly")?.price ??
    tiers?.find((t) => t.rate_type === "hourly")?.price ??
    tiers?.[0]?.price ??
    0
  );
}

// Returns undefined when the location has no daily-rate tier configured.
function pickDailyPrice(tiers: LocationDTO["pricing_tiers"], requesterTypeId?: number): number | undefined {
  const isExternal = requesterTypeId === 2;
  const typeKeyword = isExternal ? "ภายนอก" : "ภายใน";
  return (
    tiers?.find((t) => t.requester_type?.includes(typeKeyword) && t.rate_type === "daily")?.price ??
    tiers?.find((t) => t.rate_type === "daily")?.price
  );
}

// Returns undefined when the location has no off-peak hourly tier configured
// (callers should fall back to the normal hourly rate in that case).
function pickOffPeakHourlyPrice(tiers: LocationDTO["pricing_tiers"], requesterTypeId?: number): number | undefined {
  const isExternal = requesterTypeId === 2;
  const typeKeyword = isExternal ? "ภายนอก" : "ภายใน";
  return (
    tiers?.find((t) => t.requester_type?.includes(typeKeyword) && t.rate_type === "hourly_offpeak")?.price ??
    tiers?.find((t) => t.rate_type === "hourly_offpeak")?.price
  );
}

export function locationToRoom(loc: LocationDTO, requesterTypeId?: number): Room {
  return {
    id: String(loc.id),
    name: loc.name,
    building: loc.building ?? loc.type,
    floor: loc.floor_number ? `ชั้น ${loc.floor_number}` : undefined,
    capacityMin: loc.capacity,
    capacityMax: loc.capacity,
    pricePerHour: pickHourlyPrice(loc.pricing_tiers, requesterTypeId),
    pricePerHourOffPeak: pickOffPeakHourlyPrice(loc.pricing_tiers, requesterTypeId),
    pricePerDay: pickDailyPrice(loc.pricing_tiers, requesterTypeId),
    amenities: [],
    image: loc.image_url ?? DEFAULT_IMAGE,
    availability: loc.status === "available" ? "ว่างทุกวัน" : "ว่างบางวัน",
  };
}

export function locationDetailToRoom(loc: LocationDetailDTO, requesterTypeId?: number): Room {
  return {
    id: String(loc.id),
    name: loc.name,
    building: loc.building ?? loc.type,
    floor: loc.floor_number ? `ชั้น ${loc.floor_number}` : undefined,
    capacityMin: loc.capacity,
    capacityMax: loc.capacity,
    pricePerHour: pickHourlyPrice(loc.pricing_tiers, requesterTypeId),
    pricePerHourOffPeak: pickOffPeakHourlyPrice(loc.pricing_tiers, requesterTypeId),
    pricePerDay: pickDailyPrice(loc.pricing_tiers, requesterTypeId),
    amenities: loc.equipments?.map((e) => e.name) ?? [],
    image: loc.image_url ?? DEFAULT_IMAGE,
    availability: loc.status === "available" ? "ว่างทุกวัน" : "ว่างบางวัน",
  };
}
