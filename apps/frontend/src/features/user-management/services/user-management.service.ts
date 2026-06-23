import { apiClient } from "@/lib/services/api-client";
import type {
  AdminUser, StaffUser, RequesterUser, Permission,
  CreateAdminPayload, CreateStaffPayload, UpdateProfilePayload,
} from "../types";

// ── Permissions ────────────────────────────────────
export const getPermissions = () =>
  apiClient.get<Permission[]>("/permissions");

// ── Admins ─────────────────────────────────────────
export const getAdmins = () =>
  apiClient.get<AdminUser[]>("/admins");

export const createAdmin = (payload: CreateAdminPayload) =>
  apiClient.post<AdminUser>("/admins", payload);

export const updateAdmin = (id: number, payload: UpdateProfilePayload) =>
  apiClient.put<AdminUser>(`/admins/${id}`, payload);

export const deleteAdmin = (id: number) =>
  apiClient.delete<void>(`/admins/${id}`);

// ── Staffs ─────────────────────────────────────────
export const getStaffs = () =>
  apiClient.get<StaffUser[]>("/staffs");

export const createStaff = (payload: CreateStaffPayload) =>
  apiClient.post<StaffUser>("/staffs", payload);

export const updateStaff = (id: number, payload: UpdateProfilePayload) =>
  apiClient.put<StaffUser>(`/staffs/${id}`, payload);

export const deleteStaff = (id: number) =>
  apiClient.delete<void>(`/staffs/${id}`);

export const assignStaffPermissions = (id: number, permissionIds: number[]) =>
  apiClient.put<void>(`/staffs/${id}/permissions`, { permission_ids: permissionIds });

// ── Requesters ─────────────────────────────────────
export const getRequesters = () =>
  apiClient.get<RequesterUser[]>("/requesters");

export const deleteRequester = (id: number) =>
  apiClient.delete<void>(`/requesters/${id}`);
