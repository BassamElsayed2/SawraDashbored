// API Client for Dashboard - Uses fetch with React Query
// Replaces Supabase client

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions extends RequestInit {
  data?: unknown;
}

interface ApiResponse<T = unknown> {
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
      // إضافة timeout للطلب (15 ثانية)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        // Log detailed validation errors if available
        if (responseData.errors && Array.isArray(responseData.errors)) {
          // Create a detailed error message with all validation errors
          const errorDetails = responseData.errors
            .map(
              (err: { field: string; message: string }) =>
                `${err.field}: ${err.message}`
            )
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
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        throw new Error(`Request timeout: ${endpoint}`);
      }
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
    data?: unknown,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", data });
  }

  // PUT request
  put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", data });
  }

  // PATCH request
  patch<T>(
    endpoint: string,
    data?: unknown,
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
    additionalData?: Record<string, unknown>
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append("image", file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        const value = additionalData[key];
        if (typeof value === "string" || value instanceof Blob) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
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
    } catch (error) {
      throw error;
    }
  }

  // Delete file
  async deleteFile(endpoint: string, filePath: string): Promise<unknown> {
    return this.delete(endpoint, {
      data: { filePath },
    });
  }
}

export const apiClient = new ApiClient(API_URL as string);
export default apiClient;
