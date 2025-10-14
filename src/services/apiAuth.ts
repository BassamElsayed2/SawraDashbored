// Auth API Service for Dashboard - Uses Express Backend
import apiClient from "./api-client";

// ============================================================
// Types & Interfaces
// ============================================================

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role?: "user" | "admin" | "super_admin" | "manager";
  full_name?: string;
  phone?: string;
  email_verified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token?: string;
  };
  message?: string;
}

// ============================================================
// Auth Functions
// ============================================================

/**
 * Sign in with email and password
 */
export async function signIn(credentials: SignInData): Promise<AuthResponse> {
  return apiClient.post<{ user: User; token?: string }>(
    "/auth/signin",
    credentials
  );
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean }> {
  return apiClient.post("/auth/signout");
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  data: { user: User | null };
}> {
  try {
    return await apiClient.get<{ user: User | null }>("/auth/me");
  } catch {
    return { success: false, data: { user: null } };
  }
}

/**
 * Check if user is authenticated and return user data
 */
export async function checkAuth(): Promise<User | null> {
  try {
    const response = await getCurrentUser();
    return response.data.user;
  } catch {
    return null;
  }
}

/**
 * Verify if current user has admin role
 */
export async function verifyAdminRole(): Promise<boolean> {
  try {
    const user = await checkAuth();
    if (!user) return false;
    const adminRoles = ["admin", "super_admin", "manager"];
    return adminRoles.includes(user.role || "");
  } catch {
    return false;
  }
}

/**
 * Change user password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<unknown> {
  return apiClient.put("/auth/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
}): Promise<unknown> {
  return apiClient.put("/auth/profile", data);
}

/**
 * Create admin user (development only)
 * Note: In production, this should use a proper admin creation endpoint
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: "admin" | "super_admin" | "manager";
  job_title?: string;
  address?: string;
  about?: string;
  image_url?: string;
}): Promise<unknown> {
  return apiClient.post("/temp-admin/create", data);
}

// ============================================================
// Default Export
// ============================================================

const apiAuth = {
  signIn,
  signOut,
  getCurrentUser,
  checkAuth,
  verifyAdminRole,
  changePassword,
  updateProfile,
  createAdminUser,
};

export default apiAuth;
