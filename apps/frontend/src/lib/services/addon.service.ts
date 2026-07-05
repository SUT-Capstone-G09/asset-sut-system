import { apiClient } from "./api-client";

export interface BackendAddon {
  id: number;
  name: string;
  description: string;
  default_price: number;
  charge_type_id: number;
  charge_type: string;
  quantity: number;
  is_active: boolean;
}

export interface Addon {
  id: number;
  itemName: string;
  subtext: string;
  pricePerUnit: number;
}

export interface AddonRequest {
  itemName: string;
  subtext?: string;
  pricePerUnit: number;
}

const mapToFrontend = (b: BackendAddon): Addon => {
  return {
    id: b.id,
    itemName: b.name,
    subtext: b.description || "",
    pricePerUnit: b.default_price,
  };
};

const mapToBackendReq = (f: AddonRequest) => {
  return {
    name: f.itemName,
    description: f.subtext || "",
    default_price: f.pricePerUnit,
    charge_type_id: 1, // Defaulting to 1 (per_use)
    quantity: 1,
  };
};

export const addonService = {
  getAll: async () => {
    const res = await apiClient.get<BackendAddon[]>("/addons");
    return res.map(mapToFrontend);
  },
  getByID: async (id: number) => {
    const res = await apiClient.get<BackendAddon>(`/addons/${id}`);
    return mapToFrontend(res);
  },
  create: async (data: AddonRequest) => {
    const res = await apiClient.post<BackendAddon>("/addons", mapToBackendReq(data));
    return mapToFrontend(res);
  },
  update: async (id: number, data: AddonRequest) => {
    const res = await apiClient.put<BackendAddon>(`/addons/${id}`, mapToBackendReq(data));
    return mapToFrontend(res);
  },
  delete: (id: number) => apiClient.delete<{ message: string }>(`/addons/${id}`),
};
