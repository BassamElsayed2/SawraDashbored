import apiClient from "./api-client";

export interface PermissionDefinition {
  key: string;
  label_ar: string;
  group: string;
}

export interface Role {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  admins_count?: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateRoleInput {
  slug?: string;
  name_ar: string;
  name_en?: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name_ar?: string;
  name_en?: string;
  description?: string;
  permissions?: string[];
}

export async function getPermissionsCatalog(): Promise<{
  permissions: PermissionDefinition[];
  groups: Record<string, string>;
}> {
  const response = await apiClient.get<{
    permissions: PermissionDefinition[];
    groups: Record<string, string>;
  }>("/admin/permissions");
  return {
    permissions: response.data?.permissions || [],
    groups: response.data?.groups || {},
  };
}

export async function getAllRoles(): Promise<Role[]> {
  const response = await apiClient.get<{ roles: Role[] }>("/admin/roles");
  return response.data?.roles || [];
}

export async function createRole(input: CreateRoleInput): Promise<Role> {
  const response = await apiClient.post<{ role: Role }>("/admin/roles", input);
  if (!response.data?.role) throw new Error("Failed to create role");
  return response.data.role;
}

export async function updateRole(
  id: string,
  input: UpdateRoleInput
): Promise<Role> {
  const response = await apiClient.put<{ role: Role }>(
    `/admin/roles/${id}`,
    input
  );
  if (!response.data?.role) throw new Error("Failed to update role");
  return response.data.role;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/admin/roles/${id}`);
}

const apiRoles = {
  getPermissionsCatalog,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
};

export default apiRoles;
