// Customer Feedback API Service - Uses Express Backend instead of Supabase
import apiClient from "./api-client";

// Import CustomerFeedback from the types file to ensure consistency
export interface CustomerFeedback {
  id?: string;
  branch_id: string | number;
  customer_name: string;
  phone_number: string;
  email?: string;
  overall_rating: number;
  created_at?: string;
  updated_at?: string;
  opinion?: string;
  reception_rating?: number;
  service_speed_rating?: number;
  quality_rating?: number;
  cleanliness_rating?: number;
  catering_rating?: number;
}

export interface FeedbackResponse {
  feedback: CustomerFeedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedbackAnalytics {
  total_feedback: number;
  average_rating: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  category_averages: {
    category: string;
    average_rating: number;
    total_ratings: number;
  }[];
  branch_performance: {
    branch_id: string;
    branch_name: string;
    total_feedback: number;
    average_rating: number;
  }[];
}

export async function getFeedback(filters?: {
  page?: number;
  limit?: number;
  min_rating?: number;
  max_rating?: number;
  rating?: number;
  search?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<FeedbackResponse> {
  try {
    const params = new URLSearchParams();

    if (filters?.page) {
      params.append("page", filters.page.toString());
    }

    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    if (filters?.min_rating) {
      params.append("min_rating", filters.min_rating.toString());
    }

    if (filters?.max_rating) {
      params.append("max_rating", filters.max_rating.toString());
    }

    if (filters?.rating) {
      params.append("rating", filters.rating.toString());
    }

    if (filters?.search) {
      params.append("search", filters.search);
    }

    if (filters?.branchId) {
      params.append("branchId", filters.branchId);
    }

    if (filters?.startDate) {
      params.append("startDate", filters.startDate);
    }

    if (filters?.endDate) {
      params.append("endDate", filters.endDate);
    }

    const queryString = params.toString();
    const response = await apiClient.get<FeedbackResponse>(
      `/feedback${queryString ? `?${queryString}` : ""}`
    );

    // Backend returns { success: true, data: { feedback: [], total: 0, ... } }
    // Transform branch data from flat columns to nested object
    const transformedData = {
      ...response.data,
      feedback: response.data.feedback.map(
        (
          item: CustomerFeedback & {
            branch_name_ar?: string;
            branch_name_en?: string;
          }
        ) => ({
          ...item,
          branch: {
            id: item.branch_id,
            name_ar: item.branch_name_ar,
            name_en: item.branch_name_en,
          },
        })
      ),
    };

    return transformedData;
  } catch {
    // Return empty result instead of throwing to prevent undefined
    return {
      feedback: [],
      total: 0,
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      totalPages: 0,
    };
  }
}

export async function getFeedbackAnalytics(filters?: {
  branchId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<FeedbackAnalytics> {
  try {
    const params = new URLSearchParams();

    if (filters?.branchId) {
      params.append("branchId", filters.branchId);
    }

    if (filters?.startDate) {
      params.append("startDate", filters.startDate);
    }

    if (filters?.endDate) {
      params.append("endDate", filters.endDate);
    }

    const queryString = params.toString();
    const response = await apiClient.get<FeedbackAnalytics>(
      `/feedback/analytics${queryString ? `?${queryString}` : ""}`
    );

    // Backend returns analytics directly
    return response as unknown as FeedbackAnalytics;
  } catch {
    // Return empty analytics instead of throwing
    return {
      total_feedback: 0,
      average_rating: 0,
      rating_distribution: [],
      category_averages: [],
      branch_performance: [],
    };
  }
}

export async function deleteFeedback(id: string): Promise<void> {
  await apiClient.delete(`/feedback/${id}`);
}

// Submit feedback from customer (public endpoint - no auth required)
export async function submitFeedback(
  feedback: Partial<CustomerFeedback>
): Promise<unknown> {
  try {
    const response = await apiClient.post<unknown>(
      "/feedback/submit",
      feedback
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const apiCustomerFeedback = {
  getFeedback,
  getFeedbackAnalytics,
  deleteFeedback,
  submitFeedback,
};

export default apiCustomerFeedback;
