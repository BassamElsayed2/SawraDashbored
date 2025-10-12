import supabase from "./supabase";

export interface OrderItem {
  product_id?: string;
  offer_id?: string;
  type: "product" | "offer";
  title_ar: string;
  title_en: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  size?: string;
  size_data?: any;
  variants?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  delivery_type: "delivery" | "pickup";
  branch_id?: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithUserInfo extends Order {
  user_email?: string;
  user_name?: string;
  branch_name?: string;
  address?: any;
}

export const ordersApi = {
  // Get all orders (for admin dashboard)
  async getAllOrders(filters?: {
    status?: string;
    delivery_type?: string;
    branch_id?: string;
    from_date?: string;
    to_date?: string;
  }) {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        addresses (
          id,
          title,
          street,
          building,
          floor,
          apartment,
          city,
          area,
          latitude,
          longitude,
          notes
        )
      `
      )
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.delivery_type) {
      query = query.eq("delivery_type", filters.delivery_type);
    }

    if (filters?.branch_id) {
      query = query.eq("branch_id", filters.branch_id);
    }

    if (filters?.from_date) {
      query = query.gte("created_at", filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte("created_at", filters.to_date);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get single order by ID
  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        addresses (
          id,
          title,
          street,
          building,
          floor,
          apartment,
          city,
          area,
          latitude,
          longitude,
          notes
        )
      `
      )
      .eq("id", orderId)
      .single();

    return { data, error };
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order["status"]) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    return { data, error };
  },

  // Get order statistics
  async getOrderStatistics(filters?: {
    from_date?: string;
    to_date?: string;
    branch_id?: string;
  }) {
    let query = supabase.from("orders").select("*");

    if (filters?.from_date) {
      query = query.gte("created_at", filters.from_date);
    }

    if (filters?.to_date) {
      query = query.lte("created_at", filters.to_date);
    }

    if (filters?.branch_id) {
      query = query.eq("branch_id", filters.branch_id);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { data: null, error };
    }

    // Calculate statistics
    const stats = {
      total_orders: data.length,
      pending_orders: data.filter((o) => o.status === "pending").length,
      confirmed_orders: data.filter((o) => o.status === "confirmed").length,
      preparing_orders: data.filter((o) => o.status === "preparing").length,
      ready_orders: data.filter((o) => o.status === "ready").length,
      delivering_orders: data.filter((o) => o.status === "delivering").length,
      delivered_orders: data.filter((o) => o.status === "delivered").length,
      cancelled_orders: data.filter((o) => o.status === "cancelled").length,
      total_revenue: data
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, order) => sum + parseFloat(order.total.toString()), 0),
      average_order_value:
        data.length > 0
          ? data
              .filter((o) => o.status !== "cancelled")
              .reduce(
                (sum, order) => sum + parseFloat(order.total.toString()),
                0
              ) / data.filter((o) => o.status !== "cancelled").length
          : 0,
      delivery_orders: data.filter((o) => o.delivery_type === "delivery")
        .length,
      pickup_orders: data.filter((o) => o.delivery_type === "pickup").length,
    };

    return { data: stats, error: null };
  },

  // Delete order (soft delete by setting status to cancelled)
  async deleteOrder(orderId: string) {
    return this.updateOrderStatus(orderId, "cancelled");
  },

  // Update order notes
  async updateOrderNotes(orderId: string, notes: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    return { data, error };
  },

  // Assign order to branch
  async assignOrderToBranch(orderId: string, branchId: string) {
    const { data, error } = await supabase
      .from("orders")
      .update({
        branch_id: branchId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    return { data, error };
  },
};
