export interface Permission {
  id: number;
  module: string;
  action: string;
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  line_id: string;
  is_active: boolean;
}

export interface StaffUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  line_id: string;
  is_active: boolean;
  permissions: Permission[];
}

export interface RequesterUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  line_id: string;
  requester_type: string;
  requester_type_id: number;
  is_active: boolean;
}

export interface CreateAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  line_id?: string;
}

export interface CreateStaffPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  line_id?: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  line_id?: string;
}
