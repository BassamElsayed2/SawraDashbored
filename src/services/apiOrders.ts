// Orders API Service - Uses Express Backend
import apiClient from "./api-client";

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name_ar?: string;
  product_name_en?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  notes?: string;
  created_at?: string;
}

export interface Order {
  id?: string;
  order_number?: string;
  branch_id?: string;
  branch_name_ar?: string;
  branch_name_en?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  order_type: "dine-in" | "takeaway" | "delivery";
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  payment_method: "cash" | "card" | "online";
  payment_status: "pending" | "paid" | "refunded";
  subtotal?: number;
  tax?: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  notes?: string;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderFilters {
  status?: string;
  order_type?: string;
  branch_id?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  order_id?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  preparing_orders: number;
  ready_orders: number;
  delivering_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  delivery_orders: number;
  pickup_orders: number;
}

export const ordersApi = {
  getAllOrders: async (filters?: OrderFilters) => {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const response = await apiClient.get<{
        success: boolean;
        data: {
          orders: Order[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/orders/admin/all${queryString ? `?${queryString}` : ""}`);

      return {
        data: (response as { data?: { orders?: Order[] } })?.data?.orders || [],
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to fetch orders",
      };
    }
  },

  getOrderById: async (id: string) => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: { order: Order };
      }>(`/orders/admin/${id}`);
      return {
        data: (response as { data?: { order?: Order } })?.data?.order || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to fetch order",
      };
    }
  },

  createOrder: async (orderData: Partial<Order>) => {
    try {
      const response = await apiClient.post<{ order: Order }>(
        "/orders",
        orderData
      );
      return {
        data: (response as unknown as { order: Order }).order || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to create order",
      };
    }
  },

  updateOrder: async (id: string, orderData: Partial<Order>) => {
    try {
      const response = await apiClient.put<{ order: Order }>(
        `/orders/${id}`,
        orderData
      );
      return {
        data: (response as unknown as { order: Order }).order || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to update order",
      };
    }
  },

  updateOrderStatus: async (
    id: string,
    status: Order["status"],
    notes?: string
  ) => {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: { order: Order };
      }>(`/orders/${id}/status`, {
        status,
        notes,
      });
      return {
        data: (response as { data?: { order?: Order } })?.data?.order || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to update order status",
      };
    }
  },

  updateOrderNotes: async (id: string, notes: string) => {
    try {
      const response = await apiClient.put<{ order: Order }>(
        `/orders/${id}/notes`,
        {
          notes,
        }
      );
      return {
        data: (response as unknown as { order: Order }).order || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to update order notes",
      };
    }
  },

  deleteOrder: async (id: string) => {
    try {
      await apiClient.delete(`/orders/${id}`);
      return {
        data: true,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: false,
        error: (error as Error).message || "Failed to delete order",
      };
    }
  },

  getOrderStats: async (filters?: {
    start_date?: string;
    end_date?: string;
    branch_id?: string;
  }) => {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });
      }

      const queryString = params.toString();
      const response = await apiClient.get<{
        success: boolean;
        data: { stats: OrderStats };
      }>(`/orders/stats${queryString ? `?${queryString}` : ""}`);

      return {
        data:
          (response as { data?: { stats?: OrderStats } })?.data?.stats || null,
        error: null,
      };
    } catch (error: unknown) {
      return {
        data: null,
        error: (error as Error).message || "Failed to fetch order stats",
      };
    }
  },
};

export default ordersApi;
