// API Client for Dashboard - Uses fetch with React Query
// Replaces Supabase client

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  data?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const { data, headers, ...customConfig } = options;

    const config: RequestInit = {
      method: data ? "POST" : "GET",
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include", // Include cookies for auth
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      const responseData = await response.json();

      if (!response.ok) {
        // Log detailed validation errors if available
        if (responseData.errors && Array.isArray(responseData.errors)) {
          console.error("Validation Errors:", responseData.errors);

          // Create a detailed error message with all validation errors
          const errorDetails = responseData.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(", ");

          throw new Error(
            `${responseData.message || "Validation failed"}: ${errorDetails}`
          );
        }

        throw new Error(
          responseData.message || `HTTP ${response.status}: Request failed`
        );
      }

      return responseData;
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // GET request
  get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  // POST request
  post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", data });
  }

  // PUT request
  put<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", data });
  }

  // PATCH request
  patch<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", data });
  }

  // DELETE request
  delete<T>(endpoint: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Upload file (multipart/form-data)
  async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<any> {
    const formData = new FormData();
    formData.append("image", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data;
    } catch (error: any) {
      console.error(`Upload Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Delete file
  async deleteFile(endpoint: string, filePath: string): Promise<any> {
    return this.delete(endpoint, {
      data: { filePath },
    });
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
