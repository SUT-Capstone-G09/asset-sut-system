import { apiClient } from "@/lib/services/api-client";
import { Room } from "../types/room";

export interface AdminLocationDTO {
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

export interface CreateLocationPayload {
  type_id: number;
  name: string;
  building_id?: number;
  image_url?: string;
  room_number?: number;
  floor_number?: number;
  capacity: number;
  status_id: number;
}

export interface UpdateLocationPayload {
  type_id?: number;
  name?: string;
  building_id?: number;
  image_url?: string;
  room_number?: number;
  floor_number?: number;
  capacity?: number;
  status_id?: number;
}

export interface CreatePricingTierPayload {
  requester_type_id: number;
  rate_type_id: number;
  price: number;
}

export interface TypeMeta { type: string; type_id: number }
export interface StatusMeta { status: string; status_id: number }

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

export function locationToRoom(loc: AdminLocationDTO): Room {
  const image = loc.image_url ?? DEFAULT_IMAGE;
  const internalHourly = loc.pricing_tiers?.find(
    (t) => t.requester_type?.includes("ภายใน") && t.rate_type === "hourly"
  )?.price ?? 0;
  const externalHourly = loc.pricing_tiers?.find(
    (t) => t.requester_type?.includes("ภายนอก") && t.rate_type === "hourly"
  )?.price ?? 0;
  const internalDaily = loc.pricing_tiers?.find(
    (t) => t.requester_type?.includes("ภายใน") && t.rate_type === "daily"
  )?.price ?? 0;
  const externalDaily = loc.pricing_tiers?.find(
    (t) => t.requester_type?.includes("ภายนอก") && t.rate_type === "daily"
  )?.price ?? 0;
  const internalOffPeak = loc.pricing_tiers?.find(
    (t) => t.requester_type?.includes("ภายใน") && t.rate_type === "hourly_offpeak"
  )?.price ?? 0;
  const externalOffPeak = loc.pricing_tiers?.find(
    (t) => t.requester_type?.includes("ภายนอก") && t.rate_type === "hourly_offpeak"
  )?.price ?? 0;

  return {
    id: String(loc.id),
    roomName: loc.name,
    roomNumber: loc.room_number ? String(loc.room_number) : "",
    buildingId: loc.building_id ? String(loc.building_id) : undefined,
    building: loc.building ?? "",
    category: loc.type,
    capacity: loc.capacity,
    image,
    status: loc.status === "available" ? "available" : "maintenance",
    equipment: [],
    notes: "",
    rates: {
      hourlyInternal: internalHourly,
      hourlyExternal: externalHourly,
      hourlyOffPeakInternal: internalOffPeak,
      hourlyOffPeakExternal: externalOffPeak,
      dailyInternal: internalDaily,
      dailyExternal: externalDaily,
    },
    documents: [],
  };
}

export interface LocationTypeDTO {
  id: number;
  type: string;
}

export interface StaffLocationDTO {
  user_id: number;
  location_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export async function getLocationTypes(): Promise<LocationTypeDTO[]> {
  return apiClient.get<LocationTypeDTO[]>("/location-types");
}

export async function getLocations(): Promise<AdminLocationDTO[]> {
  return apiClient.get<AdminLocationDTO[]>("/locations");
}

export async function createLocation(payload: CreateLocationPayload): Promise<AdminLocationDTO> {
  return apiClient.post<AdminLocationDTO>("/locations", payload);
}

export async function updateLocation(id: number, payload: UpdateLocationPayload): Promise<AdminLocationDTO> {
  return apiClient.put<AdminLocationDTO>(`/locations/${id}`, payload);
}

export async function deleteLocation(id: number): Promise<void> {
  await apiClient.delete(`/locations/${id}`);
}

export async function createPricingTier(locationId: number, payload: CreatePricingTierPayload): Promise<void> {
  await apiClient.post(`/locations/${locationId}/pricing-tiers`, payload);
}

export async function deletePricingTier(locationId: number, tierId: number): Promise<void> {
  await apiClient.delete(`/locations/${locationId}/pricing-tiers/${tierId}`);
}

export async function getLocationStaff(locationId: number): Promise<StaffLocationDTO[]> {
  return apiClient.get<StaffLocationDTO[]>(`/locations/${locationId}/staff`);
}

export async function assignStaffToLocation(locationId: number, userId: number): Promise<void> {
  await apiClient.post(`/locations/${locationId}/staff`, { user_id: userId });
}

export async function unassignStaffFromLocation(locationId: number, userId: number): Promise<void> {
  await apiClient.delete(`/locations/${locationId}/staff/${userId}`);
}

export async function getStaffLocations(staffUserId: number): Promise<AdminLocationDTO[]> {
  return apiClient.get<AdminLocationDTO[]>(`/staffs/${staffUserId}/locations`);
}

export async function setStaffLocations(staffUserId: number, locationIds: number[]): Promise<void> {
  await apiClient.put(`/staffs/${staffUserId}/locations`, { location_ids: locationIds });
}

// requester_type_id: 1=ภายใน, 2=ภายนอก | rate_type_id: 1=hourly, 2=daily, 4=hourly_offpeak
// (3=fixed, seeded but unused here; hourly_offpeak was appended last so it got id 4 — confirm
// against GET /rate-types or the DB if the seed order ever changes)
export async function savePricingTiers(
  locationId: number,
  rates: {
    hourlyInternal: number;
    hourlyExternal: number;
    hourlyOffPeakInternal?: number;
    hourlyOffPeakExternal?: number;
    dailyInternal: number;
    dailyExternal: number;
  },
  existingTierIds: number[] = []
): Promise<void> {
  await Promise.all(existingTierIds.map((tid) => deletePricingTier(locationId, tid)));

  const creates = [
    createPricingTier(locationId, { requester_type_id: 1, rate_type_id: 1, price: rates.hourlyInternal }),
    createPricingTier(locationId, { requester_type_id: 2, rate_type_id: 1, price: rates.hourlyExternal }),
    createPricingTier(locationId, { requester_type_id: 1, rate_type_id: 2, price: rates.dailyInternal }),
    createPricingTier(locationId, { requester_type_id: 2, rate_type_id: 2, price: rates.dailyExternal }),
  ];
  // Only persist an off-peak tier when the admin actually configured one —
  // the backend's calculatePrice treats "no off-peak tier" as "bill at the
  // office rate," and always writing a price: 0 row here would defeat that
  // fallback for every location that hasn't opted into off-peak pricing.
  if (rates.hourlyOffPeakInternal) {
    creates.push(
      createPricingTier(locationId, { requester_type_id: 1, rate_type_id: 4, price: rates.hourlyOffPeakInternal })
    );
  }
  if (rates.hourlyOffPeakExternal) {
    creates.push(
      createPricingTier(locationId, { requester_type_id: 2, rate_type_id: 4, price: rates.hourlyOffPeakExternal })
    );
  }
  await Promise.all(creates);
}
