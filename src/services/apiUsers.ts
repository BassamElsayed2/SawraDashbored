// Users API Service for Dashboard
import apiClient from "./api-client";

// ============================================================
// Types & Interfaces
// ============================================================

export interface Admin {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  permissions?: string;
  image_url?: string;
  job_title?: string;
  address?: string;
  about?: string;
  is_active?: boolean;
  joined_at: string | Date;
  updated_at?: string | Date;
}

export interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  phone_verified: boolean;
  email_verified: boolean;
  is_active?: boolean;
  orders_count: number;
  joined_at: string | Date;
  updated_at?: string | Date;
}

export interface PaginatedAdminsResponse {
  admins: Admin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// API Functions
// ============================================================

export async function getAllAdmins(
  page = 1,
  limit = 10,
  filters?: { search?: string },
): Promise<PaginatedAdminsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.search) {
    params.append("search", filters.search);
  }

  const response = await apiClient.get<PaginatedAdminsResponse>(
    `/admin/all?${params.toString()}`,
  );

  return {
    admins: response.data?.admins || [],
    total: response.data?.total || 0,
    page: response.data?.page || page,
    limit: response.data?.limit || limit,
    totalPages: response.data?.totalPages || 0,
  };
}

export async function getAllUsers(
  page = 1,
  limit = 10,
  filters?: { search?: string },
): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.search) {
    params.append("search", filters.search);
  }

  const response = await apiClient.get<PaginatedUsersResponse>(
    `/admin/users?${params.toString()}`,
  );

  return {
    users: response.data?.users || [],
    total: response.data?.total || 0,
    page: response.data?.page || page,
    limit: response.data?.limit || limit,
    totalPages: response.data?.totalPages || 0,
  };
}

export async function setCustomerStatus(
  userId: string,
  isActive: boolean,
): Promise<void> {
  await apiClient.patch(`/admin/users/${userId}/status`, {
    is_active: isActive,
  });
}

export async function setAdminStatus(
  adminId: string,
  isActive: boolean,
): Promise<void> {
  await apiClient.patch(`/admin/admins/${adminId}/status`, {
    is_active: isActive,
  });
}

export async function deleteCustomer(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await apiClient.delete(`/admin/admins/${adminId}`);
}

export async function updateAdminRole(
  adminId: string,
  role: string,
): Promise<void> {
  await apiClient.patch(`/admin/admins/${adminId}/role`, { role });
}

const apiUsers = {
  getAllAdmins,
  getAllUsers,
  setCustomerStatus,
  setAdminStatus,
  deleteCustomer,
  deleteAdmin,
  updateAdminRole,
};

export default apiUsers;
