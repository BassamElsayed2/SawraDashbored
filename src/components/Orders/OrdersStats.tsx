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
}

const OrdersStats: React.FC<OrdersStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsCards = [
    {
      title: "إجمالي الطلبات",
      value: stats.total_orders,
      icon: "shopping_cart",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      title: "قيد الانتظار",
      value: stats.pending_orders,
      icon: "pending",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    {
      title: "تم التوصيل",
      value: stats.delivered_orders || 0,
      icon: "check_circle",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    {
      title: "ملغاة",
      value: stats.cancelled_orders,
      icon: "cancel",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.total_revenue.toFixed(2)} ج.م`,
      icon: "payments",
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "متوسط قيمة الطلب",
      value: `${stats.average_order_value.toFixed(2)} ج.م`,
      icon: "account_balance_wallet",
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statsCards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {card.title}
            </h3>
            <div className={`${card.color} p-2 rounded-lg`}>
              <span className="material-symbols-outlined text-white text-xl">
                {card.icon}
              </span>
            </div>
          </div>
          <p className={`text-2xl font-bold ${card.textColor} dark:text-white`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default OrdersStats;
