import apiClient from "./api-client";

export interface DashboardOrderStats {
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
}

export interface DashboardTopProduct {
  id: string;
  title: string;
  image_url: string;
  orders_count: number;
  total_revenue: number;
}

export interface DashboardStatsResponse {
  total_users: number;
  total_products: number;
  order_stats: DashboardOrderStats;
  top_products: DashboardTopProduct[];
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await apiClient.get<DashboardStatsResponse>(
    "/admin/dashboard-stats"
  );
  return response.data;
}
