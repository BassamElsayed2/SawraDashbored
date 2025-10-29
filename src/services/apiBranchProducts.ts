import apiClient from "./api-client";

// ============================================
// PRODUCT-BRANCH MANAGEMENT
// ============================================

/**
 * Get all branches for a product
 */
export async function getProductBranches(productId: string) {
  const response = await apiClient.get(`/products/${productId}/branches`);
  return (response.data as { branches: Array<{ id: string }> }).branches;
}

/**
 * Update product branches (replace all)
 */
export async function updateProductBranches(
  productId: string,
  branchIds: string[]
) {
  const response = await apiClient.put(`/products/${productId}/branches`, {
    branch_ids: branchIds,
  });
  return response.data as { success: boolean };
}

/**
 * Add product to branches
 */
export async function addProductToBranches(
  productId: string,
  branchIds: string[]
) {
  const response = await apiClient.post(`/products/${productId}/branches`, {
    branch_ids: branchIds,
  });
  return response.data as { success: boolean };
}

/**
 * Remove product from branches
 */
export async function removeProductFromBranches(
  productId: string,
  branchIds: string[]
) {
  const response = await apiClient.delete(`/products/${productId}/branches`, {
    data: { branch_ids: branchIds },
  });
  return response.data as { success: boolean };
}

// ============================================
// CATEGORY-BRANCH MANAGEMENT
// ============================================

/**
 * Get all branches for a category
 */
export async function getCategoryBranches(categoryId: string) {
  const response = await apiClient.get(`/categories/${categoryId}/branches`);
  return (response.data as { branches: Array<{ id: string }> }).branches;
}

/**
 * Update category branches (replace all)
 */
export async function updateCategoryBranches(
  categoryId: string,
  branchIds: string[]
) {
  const response = await apiClient.put(`/categories/${categoryId}/branches`, {
    branch_ids: branchIds,
  });
  return response.data as { success: boolean };
}

/**
 * Add category to branches
 */
export async function addCategoryToBranches(
  categoryId: string,
  branchIds: string[]
) {
  const response = await apiClient.post(`/categories/${categoryId}/branches`, {
    branch_ids: branchIds,
  });
  return response.data as { success: boolean };
}

/**
 * Remove category from branches
 */
export async function removeCategoryFromBranches(
  categoryId: string,
  branchIds: string[]
) {
  const response = await apiClient.delete(
    `/categories/${categoryId}/branches`,
    { data: { branch_ids: branchIds } }
  );
  return response.data as { success: boolean };
}

// ============================================
// BRANCH-SPECIFIC QUERIES
// ============================================

/**
 * Get all products in a branch
 */
export async function getBranchProducts(branchId: string) {
  const response = await apiClient.get(`/branches/${branchId}/products`);
  return (response.data as { products: unknown[] }).products;
}

/**
 * Get all categories in a branch
 */
export async function getBranchCategories(branchId: string) {
  const response = await apiClient.get(`/branches/${branchId}/categories`);
  return (response.data as { categories: unknown[] }).categories;
}
