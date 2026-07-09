"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Order, ordersApi } from "@/services/apiOrders";

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; color: string; dot: string }
> = {
  pending: {
    label: "قيد الانتظار",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  pending_payment: {
    label: "بانتظار الدفع",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  confirmed: {
    label: "تم الدفع",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "قيد التحضير",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  ready: {
    label: "جاهز",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  delivering: {
    label: "قيد التوصيل",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  out_for_delivery: {
    label: "قيد التوصيل",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "تم التوصيل",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "ملغي",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-red-500",
  },
};

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} د`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `منذ ${diffHours} س`;
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
  }).format(date);
}

const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    ordersApi.getAllOrders({ limit: 5, page: 1 }).then(({ data }) => {
      if (mounted) {
        setOrders(data?.slice(0, 5) || []);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-primary-500">history</span>
          أحدث الطلبات
        </h2>
        <Link
          href="/dashboard/orders/"
          className="text-sm font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
        >
          عرض الكل
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl p-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center">
          <span className="material-symbols-outlined mb-3 block text-5xl text-gray-300 dark:text-gray-600">
            receipt_long
          </span>
          <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            return (
              <div key={order.id}>
                <Link
                  href={`/dashboard/orders/${order.id}/`}
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-gray-100 hover:bg-gray-50 dark:hover:border-[#172036] dark:hover:bg-gray-800/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                    <span className="material-symbols-outlined text-[20px] text-primary-600 dark:text-primary-400">
                      receipt
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {order.order_number || `#${order.id?.slice(0, 8)}`}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {order.customer_name || "عميل"} ·{" "}
                      {formatRelativeTime(order.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {Number(order.total).toLocaleString()} ج.م
                    </p>
                    <span className="material-symbols-outlined text-[18px] text-gray-300 transition group-hover:text-primary-500">
                      chevron_left
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
