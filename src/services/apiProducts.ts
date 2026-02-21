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
    const response = (await apiClient.uploadFile("/upload/image", file, {
      bucket: "product-images",
      folder,
    })) as { data: { url?: string; imageUrl?: string } };

    // Return the image URL from the response
    return response.data.url || response.data.imageUrl || "";
  } catch {
    throw new Error("تعذر رفع صورة المنتج");
  }
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    let bucket: string;
    let path: string;

    // Backend URL format: .../uploads/product-images/filename.jpg
    const uploadsIndex = pathSegments.indexOf("uploads");
    if (uploadsIndex !== -1 && pathSegments.length > uploadsIndex + 1) {
      bucket = pathSegments[uploadsIndex + 1];
      path = pathSegments.slice(uploadsIndex + 1).join("/");
    } else {
      // Legacy Supabase URL: .../storage/v1/object/public/[bucket]/[path]
      const publicIndex = pathSegments.indexOf("public");
      if (publicIndex !== -1 && pathSegments.length > publicIndex + 2) {
        bucket = pathSegments[publicIndex + 1];
        path = pathSegments.slice(publicIndex + 2).join("/");
      } else {
        throw new Error("Invalid image URL format");
      }
    }

    await apiClient.delete("/upload/image", {
      data: { bucket, path },
    });
  } catch (error) {
    throw error;
  }
}

const apiProducts = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
};

export default apiProducts;
