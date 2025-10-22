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
  role: "admin" | "super_admin" | "manager";
  permissions?: string;
  image_url?: string;
  job_title?: string;
  address?: string;
  about?: string;
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
  orders_count: number;
  joined_at: string | Date;
  updated_at?: string | Date;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Get all admin users
 */
export async function getAllAdmins(): Promise<Admin[]> {
  try {
    const response = await apiClient.get<{ admins: Admin[] }>("/admin/all");
    return response.data?.admins || [];
  } catch (error) {
    throw error;
  }
}

/**
 * Get all regular users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get<{ users: User[] }>("/admin/users");
    return response.data?.users || [];
  } catch (error) {
    throw error;
  }
}

// ============================================================
// Default Export
// ============================================================

const apiUsers = {
  getAllAdmins,
  getAllUsers,
};

export default apiUsers;
