"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ordersApi, Order } from "@/services/apiOrders";
import OrdersStats from "@/components/Orders/OrdersStats";
import OrdersFilters from "@/components/Orders/OrdersFilters";
import OrdersTable from "@/components/Orders/OrdersTable";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import toast from "react-hot-toast";

type OrderFilters = {
  status?: string;
  branch_id?: string;
  from_date?: string;
  to_date?: string;
  order_id?: string;
  customer_name?: string;
};

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
  const [filters, setFilters] = useState<OrderFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<
    Array<{ id?: string; name_ar: string }>
  >([]);

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);

      try {
        const { data, error } = await ordersApi.getAllOrders(filters);
        if (error) {
          if (!silent) toast.error("حدث خطأ أثناء جلب الطلبات");
        } else {
          setOrders(data || []);
        }
      } catch {
        if (!silent) toast.error("حدث خطأ غير متوقع");
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [filters]
  );

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await ordersApi.getOrderStats(filters);
      if (!error) setStats(data);
    } catch {
      // silent
    }
  }, [filters]);

  const refreshData = useCallback(
    async (silent = true) => {
      await Promise.all([fetchOrders(silent), fetchStats()]);
    },
    [fetchOrders, fetchStats]
  );

  const fetchBranches = async () => {
    try {
      const { getBranches } = await import("@/services/apiBranches");
      const data = await getBranches();
      if (data) setBranches(data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchBranches();
  }, [fetchOrders, fetchStats]);

  useOrderSocket({
    onOrderCreated: () => {
      toast.success("📦 طلب جديد وارد!");
      void refreshData(true);
    },
    onOrderUpdated: () => {
      void refreshData(true);
    },
    onOrderDeleted: () => {
      void refreshData(true);
    },
  });

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const { error } = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (error) {
        toast.error("فشل تحديث حالة الطلب");
      } else {
        toast.success("تم تحديث حالة الطلب");
        void refreshData(true);
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
        toast.success("تم حذف الطلب");
        void refreshData(true);
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as OrderFilters);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status || undefined,
    }));
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          <span className="material-symbols-outlined text-[14px]">
            receipt_long
          </span>
          إدارة الطلبات
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          جميع الطلبات
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          متابعة وإدارة طلبات العملاء في الوقت الفعلي
        </p>
      </div>

      <OrdersStats
        stats={stats}
        isLoading={isLoading}
        activeStatus={filters.status || ""}
        onStatusFilter={handleStatusFilter}
      />

      <OrdersFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        branches={branches}
        totalResults={orders.length}
      />

      <OrdersTable
        orders={orders}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
