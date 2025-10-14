// Categories API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface Category {
  id?: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getCategories(filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<Category[]> {
  const params = new URLSearchParams();

  if (filters?.is_active !== undefined) {
    params.append("is_active", filters.is_active.toString());
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  const queryString = params.toString();
  const response = await apiClient.get<{ categories: Category[] }>(
    `/categories${queryString ? `?${queryString}` : ""}`
  );

  return response.data.categories || [];
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await apiClient.get<{ category: Category }>(
    `/categories/${id}`
  );
  return response.data.category;
}

export async function createCategory(
  categoryData: Category
): Promise<Category> {
  const response = await apiClient.post<{ category: Category }>(
    "/categories",
    categoryData
  );
  return response.data.category;
}

export async function updateCategory(
  id: string,
  updatedCategory: Partial<Category>
): Promise<Category> {
  const response = await apiClient.put<{ category: Category }>(
    `/categories/${id}`,
    updatedCategory
  );
  return response.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function uploadCategoryImage(
  file: File,
  folder = "categories"
): Promise<string> {
  try {
    const response = await apiClient.uploadFile("/upload/image", file, {
      folder,
    });
    return response.data.url || response.data.imageUrl;
  } catch (error: any) {
    console.error("خطأ أثناء رفع صورة الفئة:", error.message);
    throw new Error("تعذر رفع صورة الفئة");
  }
}

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
};
