// News API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

export interface NewsArticle {
  id?: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  image_url?: string;
  is_active?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getNews(filters?: {
  is_active?: boolean;
  search?: string;
}): Promise<NewsArticle[]> {
  const params = new URLSearchParams();

  if (filters?.is_active !== undefined) {
    params.append("is_active", filters.is_active.toString());
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  const queryString = params.toString();
  const response = await apiClient.get<{ news: NewsArticle[] }>(
    `/news${queryString ? `?${queryString}` : ""}`
  );

  return response.data.news || [];
}

export async function getNewsById(id: string): Promise<NewsArticle> {
  const response = await apiClient.get<{ article: NewsArticle }>(`/news/${id}`);
  return response.data.article;
}

export async function createNews(newsData: NewsArticle): Promise<NewsArticle> {
  const response = await apiClient.post<{ article: NewsArticle }>(
    "/news",
    newsData
  );
  return response.data.article;
}

export async function updateNews(
  id: string,
  updatedNews: Partial<NewsArticle>
): Promise<NewsArticle> {
  const response = await apiClient.put<{ article: NewsArticle }>(
    `/news/${id}`,
    updatedNews
  );
  return response.data.article;
}

export async function deleteNews(id: string): Promise<void> {
  await apiClient.delete(`/news/${id}`);
}

export async function uploadNewsImage(file: File): Promise<string> {
  const response = (await apiClient.uploadFile("/upload/image", file, {
    folder: "news",
  })) as { data: { url?: string; imageUrl?: string } };
  return response.data.url || response.data.imageUrl || "";
}

const apiNews = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  uploadNewsImage,
};

export default apiNews;
