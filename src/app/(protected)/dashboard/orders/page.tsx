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

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await ordersApi.getAllOrders(filters);
      if (error) {
        toast.error("حدث خطأ أثناء جلب الطلبات");
        console.error(error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await ordersApi.getOrderStats(filters);
      if (error) {
        console.error("Error fetching stats:", error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const { error } = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (error) {
        toast.error("فشل تحديث حالة الطلب");
        console.error(error);
      } else {
        toast.success("تم تحديث حالة الطلب بنجاح");
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    }
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          إدارة الطلبات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض وإدارة جميع طلبات العملاء
        </p>
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
      />
    </div>
  );
}
