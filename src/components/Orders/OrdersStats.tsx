"use client";

import React from "react";

interface OrdersStatsProps {
  stats: {
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
  } | null;
  isLoading?: boolean;
  activeStatus?: string;
  onStatusFilter?: (status: string) => void;
}

const OrdersStats: React.FC<OrdersStatsProps> = ({
  stats,
  isLoading,
  activeStatus = "",
  onStatusFilter,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#172036] dark:bg-[#0c1427]"
            >
              <div className="mb-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-7 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const primaryCards = [
    {
      title: "إجمالي الطلبات",
      value: stats.total_orders,
      icon: "receipt_long",
      gradient: "from-blue-500 to-blue-600",
      filterKey: "",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.total_revenue.toLocaleString()} ج.م`,
      icon: "payments",
      gradient: "from-green-500 to-emerald-600",
      filterKey: "delivered",
    },
    {
      title: "متوسط الطلب",
      value: `${stats.average_order_value.toFixed(0)} ج.م`,
      icon: "account_balance_wallet",
      gradient: "from-purple-500 to-purple-600",
      filterKey: "",
    },
    {
      title: "قيد التنفيذ",
      value:
        (stats.confirmed_orders || 0) +
        (stats.preparing_orders || 0) +
        (stats.delivering_orders || 0),
      icon: "pending_actions",
      gradient: "from-orange-500 to-orange-600",
      filterKey: "preparing",
    },
  ];

  const statusPills = [
    { key: "", label: "الكل", count: stats.total_orders },
    {
      key: "pending_payment",
      label: "بانتظار الدفع",
      count: stats.pending_orders || 0,
    },
    { key: "confirmed", label: "تم الدفع", count: stats.confirmed_orders || 0 },
    {
      key: "preparing",
      label: "قيد التحضير",
      count: stats.preparing_orders || 0,
    },
    { key: "ready", label: "جاهز", count: stats.ready_orders || 0 },
    {
      key: "delivering",
      label: "قيد التوصيل",
      count: stats.delivering_orders || 0,
    },
    {
      key: "delivered",
      label: "تم التوصيل",
      count: stats.delivered_orders || 0,
    },
    { key: "cancelled", label: "ملغي", count: stats.cancelled_orders || 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {primaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#172036] dark:bg-[#0c1427]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${card.gradient}`}
              >
                <span className="material-symbols-outlined text-[20px] text-white">
                  {card.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {statusPills.map((pill) => {
          const isActive = activeStatus === pill.key;
          return (
            <button
              key={pill.key || "all"}
              type="button"
              onClick={() => onStatusFilter?.(pill.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/25"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:border-[#172036] dark:bg-[#0c1427] dark:text-gray-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/20"
              }`}
            >
              {pill.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersStats;
