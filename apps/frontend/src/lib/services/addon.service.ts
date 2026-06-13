import { apiClient } from "./api-client";

export interface Addon {
  id: number;
  itemName: string;
  subtext: string;
  category: string;
  pricePerUnit: number;
}

export interface AddonRequest {
  itemName: string;
  subtext?: string;
  category: string;
  pricePerUnit: number;
}

export const addonService = {
  getAll: () => apiClient.get<Addon[]>("/addons"),
  getByID: (id: number) => apiClient.get<Addon>(`/addons/${id}`),
  create: (data: AddonRequest) => apiClient.post<Addon>("/addons", data),
  update: (id: number, data: AddonRequest) => apiClient.put<Addon>(`/addons/${id}`, data),
  delete: (id: number) => apiClient.delete<{ message: string }>(`/addons/${id}`),
};
