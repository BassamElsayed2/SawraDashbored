// Combo Offers API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface ComboOffer {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  price: number;
  original_price?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getOffers(filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<ComboOffer[]> {
  const params = new URLSearchParams();

  if (filters?.is_active !== undefined) {
    params.append("is_active", filters.is_active.toString());
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  const queryString = params.toString();
  const response = await apiClient.get<{ offers: ComboOffer[] }>(
    `/combo-offers${queryString ? `?${queryString}` : ""}`
  );

  return response.data.offers || [];
}

export async function getOfferById(id: string): Promise<ComboOffer> {
  const response = await apiClient.get<{ offer: ComboOffer }>(
    `/combo-offers/${id}`
  );
  return response.data.offer;
}

export async function createOffer(offerData: ComboOffer): Promise<ComboOffer> {
  const response = await apiClient.post<{ offer: ComboOffer }>(
    "/combo-offers",
    offerData
  );
  return response.data.offer;
}

export async function updateOffer(
  id: string,
  updatedOffer: Partial<ComboOffer>
): Promise<ComboOffer> {
  const response = await apiClient.put<{ offer: ComboOffer }>(
    `/combo-offers/${id}`,
    updatedOffer
  );
  return response.data.offer;
}

export async function deleteOffer(id: string): Promise<void> {
  await apiClient.delete(`/combo-offers/${id}`);
}

export async function uploadOfferImage(file: File): Promise<string> {
  const response = (await apiClient.uploadFile("/upload/image", file, {
    folder: "offers",
  })) as { data: { url?: string; imageUrl?: string } };
  return response.data.url || response.data.imageUrl || "";
}

const apiComboOffers = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  uploadOfferImage,
};

export default apiComboOffers;
