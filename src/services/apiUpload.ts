// Upload API Service
import apiClient from "./api-client";

export interface UploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  file: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
}

export async function uploadBranchImage(file: File): Promise<UploadResponse> {
  // Use uploadFile method which correctly handles multipart/form-data
  // without manually setting Content-Type header (browser will auto-set with boundary)
  const response = (await apiClient.uploadFile(
    "/upload/branch-image",
    file
  )) as UploadResponse;

  return response;
}

export async function deleteImage(filename: string): Promise<void> {
  await apiClient.delete(`/upload/image/${filename}`);
}

const apiUpload = {
  uploadBranchImage,
  deleteImage,
};

export default apiUpload;
