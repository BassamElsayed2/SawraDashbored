// Property (Settings) API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface Property {
  id?: string;
  key: string;
  value: string;
  type?: "text" | "number" | "boolean" | "json";
  description?: string;
  updated_at?: string;
}

export async function getProperties(): Promise<Property[]> {
  const response = await apiClient.get<{ properties: Property[] }>("/settings");
  return response.data.properties || [];
}

export async function getPropertyByKey(key: string): Promise<Property> {
  const response = await apiClient.get<{ property: Property }>(
    `/settings/${key}`
  );
  return response.data.property;
}

export async function updateProperty(
  key: string,
  value: string
): Promise<Property> {
  const response = await apiClient.put<{ property: Property }>(
    `/settings/${key}`,
    { value }
  );
  return response.data.property;
}

export async function createProperty(
  propertyData: Property
): Promise<Property> {
  const response = await apiClient.post<{ property: Property }>(
    "/settings",
    propertyData
  );
  return response.data.property;
}

export async function deleteProperty(key: string): Promise<void> {
  await apiClient.delete(`/settings/${key}`);
}

export default {
  getProperties,
  getPropertyByKey,
  updateProperty,
  createProperty,
  deleteProperty,
};
