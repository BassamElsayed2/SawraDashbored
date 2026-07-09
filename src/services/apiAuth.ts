// Auth API Service for Dashboard - Uses separate dashboard auth endpoints
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
  role?: string;
  is_admin?: boolean;
  permissions?: string[];
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
 * Sign in with email and password (dashboard accounts only)
 */
export async function signIn(credentials: SignInData): Promise<AuthResponse> {
  return apiClient.post<{ user: User; token?: string }>(
    "/dashboard/auth/signin",
    credentials
  );
}

/**
 * Sign out current dashboard user
 */
export async function signOut(): Promise<{ success: boolean }> {
  return apiClient.post("/dashboard/auth/signout");
}

/**
 * Get current authenticated dashboard user
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  data: { user: User | null };
}> {
  try {
    return await apiClient.get<{ user: User | null }>("/dashboard/auth/me");
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
 * Change dashboard user password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<unknown> {
  return apiClient.put("/dashboard/auth/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
}

/**
 * Update dashboard user profile
 */
export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
}): Promise<unknown> {
  return apiClient.put("/dashboard/auth/profile", data);
}

/**
 * Check if a phone number is available (admin only)
 */
export async function checkPhoneAvailability(phone: string): Promise<{
  success: boolean;
  exists: boolean;
  message?: string;
}> {
  const params = new URLSearchParams({ phone });
  const response = await apiClient.get<{ exists: boolean }>(
    `/admin/admins/check-phone?${params.toString()}`
  );
  return response as unknown as {
    success: boolean;
    exists: boolean;
    message?: string;
  };
}

/**
 * Create admin user (requires authenticated admin session)
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: string;
  job_title?: string;
  address?: string;
  about?: string;
  image_url?: string;
}): Promise<unknown> {
  return apiClient.post("/admin/admins", data);
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
  checkPhoneAvailability,
  createAdminUser,
};

export default apiAuth;
