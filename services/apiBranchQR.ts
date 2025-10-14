// Branch QR API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface Branch {
  id?: string;
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  phone?: string;
  email?: string;
  lat?: number; // Changed from latitude to match backend
  lng?: number; // Changed from longitude to match backend
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getBranches(filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<Branch[]> {
  const params = new URLSearchParams();

  if (filters?.is_active !== undefined) {
    params.append("is_active", filters.is_active.toString());
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  const queryString = params.toString();
  const response = await apiClient.get<{ branches: Branch[] }>(
    `/branches${queryString ? `?${queryString}` : ""}`
  );

  // Backend returns { success: true, branches: [...] } directly
  // API client returns this as-is (not wrapped in another data field)
  return (response as unknown as { branches: Branch[] }).branches || [];
}

export async function getBranchById(id: string): Promise<Branch> {
  const response = await apiClient.get<{ branch: Branch }>(`/branches/${id}`);
  // Backend returns { success: true, branch: {...} } directly
  return (response as unknown as { branch: Branch }).branch;
}

// Public endpoint - no auth required for customer feedback survey
export async function getPublicBranch(id: string): Promise<Branch> {
  const response = await apiClient.get<{ branch: Branch }>(`/branches/${id}`);
  // Backend returns { success: true, branch: {...} } directly
  return (response as unknown as { branch: Branch }).branch;
}

export async function createBranch(branchData: Branch): Promise<Branch> {
  const response = await apiClient.post<{ branch: Branch }>(
    "/branches",
    branchData
  );
  // Backend returns { success: true, message: "...", branch: {...} } directly
  return (response as unknown as { branch: Branch }).branch;
}

export async function updateBranch(
  id: string,
  updatedBranch: Partial<Branch>
): Promise<Branch> {
  const response = await apiClient.put<{ branch: Branch }>(
    `/branches/${id}`,
    updatedBranch
  );
  // Backend returns { success: true, message: "...", branch: {...} } directly
  return (response as unknown as { branch: Branch }).branch;
}

export async function deleteBranch(id: string): Promise<void> {
  await apiClient.delete(`/branches/${id}`);
}

// ============ QR Code Functions ============

export interface BranchQRCode {
  id: string;
  branch_id: string;
  qr_code_url: string;
  survey_url: string;
  created_at: string;
}

export async function generateQRCode(branchId: string): Promise<BranchQRCode> {
  const response = await apiClient.post<{ qrCode: BranchQRCode }>(
    `/qrcode/generate/${branchId}`,
    {}
  );
  // Backend returns { success: true, qrCode: {...} } directly
  return (response as unknown as { qrCode: BranchQRCode }).qrCode;
}

export async function getQRCode(
  branchId: string
): Promise<BranchQRCode | null> {
  try {
    const response = await apiClient.get<{ qrCode: BranchQRCode }>(
      `/qrcode/${branchId}`
    );
    // Backend returns { success: true, qrCode: {...} } directly
    return (response as unknown as { qrCode: BranchQRCode }).qrCode;
  } catch (error: unknown) {
    // 404 means QR code doesn't exist yet - this is normal
    const errorMessage = (error as Error).message;
    if (errorMessage?.includes("not found") || errorMessage?.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function getAllQRCodes(): Promise<BranchQRCode[]> {
  const response = await apiClient.get<{ qrCodes: BranchQRCode[] }>("/qrcode");
  // Backend returns { success: true, qrCodes: [...] } directly
  return (response as unknown as { qrCodes: BranchQRCode[] }).qrCodes || [];
}

export async function deleteQRCode(branchId: string): Promise<void> {
  await apiClient.delete(`/qrcode/${branchId}`);
}

export default {
  getBranches,
  getBranchById,
  getPublicBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  generateQRCode,
  getQRCode,
  getAllQRCodes,
  deleteQRCode,
};
