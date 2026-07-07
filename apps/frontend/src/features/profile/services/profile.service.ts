import { apiClient } from "@/lib/services/api-client";

export interface RequesterProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  line_id: string;
  requester_type: string;
  is_active: boolean;
}

export async function getMyRequesterProfile(): Promise<RequesterProfile> {
  return apiClient.get<RequesterProfile>("/me/requester");
}

export async function changePasswordApi(oldPassword: string, newPassword: string): Promise<void> {
  await apiClient.put("/me/password", { old_password: oldPassword, new_password: newPassword });
}
