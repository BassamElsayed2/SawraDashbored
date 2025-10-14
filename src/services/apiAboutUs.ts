// About Us API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface AboutUsContent {
  id?: string;
  title_ar?: string;
  title_en?: string;
  content_ar: string;
  content_en: string;
  mission_ar?: string;
  mission_en?: string;
  vision_ar?: string;
  vision_en?: string;
  values_ar?: string;
  values_en?: string;
  updated_at?: string;
}

export async function getAboutUs(): Promise<AboutUsContent> {
  const response = await apiClient.get<{ content: AboutUsContent }>("/about");
  return response.data.content;
}

export async function updateAboutUs(
  content: Partial<AboutUsContent>
): Promise<AboutUsContent> {
  const response = await apiClient.put<{ content: AboutUsContent }>(
    "/about",
    content
  );
  return response.data.content;
}

const apiAboutUs = {
  getAboutUs,
  updateAboutUs,
};

export default apiAboutUs;
