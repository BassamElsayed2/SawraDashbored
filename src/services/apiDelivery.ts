import apiClient from "./api-client";

export interface DeliveryFeeConfig {
  id: string;
  min_distance_km: number;
  max_distance_km: number;
  fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const deliveryApi = {
  // Get all delivery fee configurations
  getDeliveryFeeConfigs: async () => {
    try {
      const response = await apiClient.get<{ configs: DeliveryFeeConfig[] }>(
        "/delivery/fee-configs"
      );
      return {
        data: response.data.configs || [],
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error:
          (error as Error).message || "Failed to fetch delivery fee configs",
      };
    }
  },

  // Create delivery fee configuration
  createDeliveryFeeConfig: async (config: {
    min_distance_km: number;
    max_distance_km: number;
    fee: number;
  }) => {
    try {
      const response = await apiClient.post<{ config: DeliveryFeeConfig }>(
        "/delivery/fee-configs",
        config
      );
      return {
        data: response.data.config || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error:
          (error as Error).message || "Failed to create delivery fee config",
      };
    }
  },

  // Update delivery fee configuration
  updateDeliveryFeeConfig: async (
    id: string,
    config: {
      min_distance_km?: number;
      max_distance_km?: number;
      fee?: number;
      is_active?: boolean;
    }
  ) => {
    try {
      // Filter out invalid values (undefined, null, NaN)
      const cleanConfig: Record<string, string | number | boolean> = {};

      Object.entries(config).forEach(([key, value]) => {
        // For boolean values, allow false but not null/undefined
        if (key === "is_active") {
          if (value !== undefined && value !== null) {
            cleanConfig[key] = value;
          }
        } else {
          // For numeric values, check if they're valid numbers
          if (value !== undefined && value !== null && !Number.isNaN(value)) {
            cleanConfig[key] = value;
          }
        }
      });

      if (Object.keys(cleanConfig).length === 0) {
        return {
          data: null,
          error: "No valid fields to update",
        };
      }

      const response = await apiClient.put<{ config: DeliveryFeeConfig }>(
        `/delivery/fee-configs/${id}`,
        cleanConfig
      );
      return {
        data: response.data.config || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error:
          (error as Error).message || "Failed to update delivery fee config",
      };
    }
  },

  // Delete delivery fee configuration
  deleteDeliveryFeeConfig: async (id: string) => {
    try {
      await apiClient.delete(`/delivery/fee-configs/${id}`);
      return {
        success: true,
        error: null,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          (error as Error).message || "Failed to delete delivery fee config",
      };
    }
  },
};
