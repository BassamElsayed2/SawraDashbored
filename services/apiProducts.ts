// Products API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface Product {
  id?: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  category_id: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductType {
  id?: string;
  product_id?: string;
  name_ar: string;
  name_en: string;
  created_at?: string;
}

export interface ProductSize {
  id?: string;
  type_id?: string;
  size_ar: string;
  size_en: string;
  price: number;
  offer_price?: number;
  created_at?: string;
}

export interface ProductTypeWithSizes extends ProductType {
  sizes?: ProductSize[];
}

export interface ProductWithTypes extends Product {
  types?: ProductTypeWithSizes[];
  category_name_ar?: string;
  category_name_en?: string;
}

export async function getProducts(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    search?: string;
    date?: string;
    is_active?: boolean;
  }
): Promise<{
  products: ProductWithTypes[];
  total: number;
  totalPages: number;
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.categoryId) {
    params.append("category_id", filters.categoryId);
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  if (filters?.is_active !== undefined) {
    params.append("is_active", filters.is_active.toString());
  }

  const response = await apiClient.get<{
    products: ProductWithTypes[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/products?${params.toString()}`);

  return {
    products: response.data.products || [],
    total: response.data.total || 0,
    totalPages: response.data.totalPages || 0,
  };
}

export async function getProductById(id: string): Promise<ProductWithTypes> {
  const response = await apiClient.get<{ product: ProductWithTypes }>(
    `/products/${id}`
  );
  return response.data.product;
}

export async function createProduct(
  productData: ProductWithTypes
): Promise<ProductWithTypes> {
  const response = await apiClient.post<{ product: ProductWithTypes }>(
    "/products",
    productData
  );
  return response.data.product;
}

export async function updateProduct(
  id: string,
  updatedProduct: Partial<ProductWithTypes>
): Promise<ProductWithTypes> {
  const response = await apiClient.put<{ product: ProductWithTypes }>(
    `/products/${id}`,
    updatedProduct
  );
  return response.data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function uploadProductImage(
  file: File,
  folder = "products"
): Promise<string> {
  try {
    const response = await apiClient.uploadFile("/upload/image", file, {
      folder,
    });

    // Return the image URL from the response
    return response.data.url || response.data.imageUrl;
  } catch (error: any) {
    console.error("خطأ أثناء رفع صورة المنتج:", error.message);
    throw new Error("تعذر رفع صورة المنتج");
  }
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL if needed
    const path = new URL(imageUrl).pathname;
    await apiClient.deleteFile("/upload/image", path);
  } catch (error: any) {
    console.error("فشل حذف صورة المنتج:", error.message);
    throw error;
  }
}

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
};
