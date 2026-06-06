import { apiClient, AUTH_SUFFIX } from "./api-client";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  line_id?: string;
  phone?: string;
  requester_type_id: number;
}

export async function loginApi(email: string, password: string) {
  const data = await apiClient.post<LoginResponse>(`/auth/login${AUTH_SUFFIX()}`, { email, password });
  return { token: data.access_token, user: data.user };
}

export async function registerApi(payload: RegisterPayload) {
  await apiClient.post("/auth/register", payload);
}

export async function logoutApi() {
  await apiClient.post(`/auth/logout${AUTH_SUFFIX()}`).catch(() => {});
}

export async function refreshTokenApi() {
  const data = await apiClient.post<LoginResponse>(`/auth/refresh${AUTH_SUFFIX()}`);
  return { token: data.access_token, user: data.user };
}
