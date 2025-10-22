"use client";

import React, { useState, useEffect } from "react";
import { ordersApi, Order } from "@/services/apiOrders";
import OrdersStats from "@/components/Orders/OrdersStats";
import OrdersFilters from "@/components/Orders/OrdersFilters";
import OrdersTable from "@/components/Orders/OrdersTable";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
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
  } | null>(null);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<
    Array<{ id?: string; name_ar: string }>
  >([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const { data, error } = await ordersApi.getAllOrders(filters);
      if (error) {
        if (!silent) toast.error("حدث خطأ أثناء جلب الطلبات");
      } else {
        const newOrders = data || [];
        // Check if there are new orders
        if (orders.length > 0 && newOrders.length > orders.length) {
          toast.success("📦 طلب جديد وارد!");
        }
        setOrders(newOrders);
        setLastUpdate(new Date());
      }
    } catch {
      if (!silent) toast.error("حدث خطأ غير متوقع");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await ordersApi.getOrderStats(filters);
      if (error) {
        // Error fetching stats
      } else {
        setStats(data);
      }
    } catch {
      // Error fetching stats
    }
  };

  const fetchBranches = async () => {
    try {
      // Import the branches API dynamically
      const { getBranches } = await import("@/services/apiBranches");
      const data = await getBranches();
      if (data) {
        setBranches(data);
      }
    } catch {
      // Error fetching branches
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Auto-refresh orders every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders(true); // Silent refresh
      fetchStats();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, autoRefresh]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const { error } = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (error) {
        toast.error("فشل تحديث حالة الطلب");
      } else {
        toast.success("تم تحديث حالة الطلب بنجاح");
        fetchOrders();
        fetchStats();
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      const { error } = await ordersApi.deleteOrder(orderId);
      if (error) {
        toast.error("فشل حذف الطلب");
      } else {
        toast.success("تم حذف الطلب بنجاح");
        fetchOrders();
        fetchStats();
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إدارة الطلبات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض وإدارة جميع طلبات العملاء
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></span>
            {autoRefresh ? "التحديث التلقائي مفعل" : "التحديث التلقائي متوقف"}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            آخر تحديث: {lastUpdate.toLocaleTimeString("ar-EG")}
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <OrdersStats stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <OrdersFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        branches={branches}
      />

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
