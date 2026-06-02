import { apiClient } from "@/lib/services/api-client";
import { Room } from "@/features/bookings/types";

export interface LocationDTO {
  id: number;
  parent_id?: number;
  type_id: number;
  type: string;
  name: string;
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
  equipments: { id: number; equipment_id: number; name: string; quantity: number }[];
  addons: AddonDTO[];
  pricing_tiers: PricingTierDTO[];
}

export async function getLocations(): Promise<LocationDTO[]> {
  return apiClient.get<LocationDTO[]>("/locations");
}

export async function getLocationById(id: number): Promise<LocationDetailDTO> {
  return apiClient.get<LocationDetailDTO>(`/locations/${id}`);
}

export function locationToRoom(loc: LocationDTO): Room {
  return {
    id: String(loc.id),
    name: loc.name,
    building: loc.type,
    floor: loc.floor_number ? `ชั้น ${loc.floor_number}` : undefined,
    capacityMin: loc.capacity,
    capacityMax: loc.capacity,
    pricePerHour: loc.pricing_tiers?.[0]?.price ?? 0,
    amenities: [],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    availability: loc.status === "available" ? "ว่างทุกวัน" : "ว่างบางวัน",
  };
}

export function locationDetailToRoom(loc: LocationDetailDTO): Room {
  const pricePerHour =
    loc.pricing_tiers.length > 0 ? loc.pricing_tiers[0].price : 0;

  return {
    id: String(loc.id),
    name: loc.name,
    building: loc.type,
    floor: loc.floor_number ? `ชั้น ${loc.floor_number}` : undefined,
    capacityMin: loc.capacity,
    capacityMax: loc.capacity,
    pricePerHour,
    amenities: loc.equipments?.map((e) => e.name) ?? [],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    availability: loc.status === "available" ? "ว่างทุกวัน" : "ว่างบางวัน",
  };
}
