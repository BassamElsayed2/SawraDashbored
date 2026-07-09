"use client";

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  gradient: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  gradient,
  subtitle,
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-[#172036] dark:bg-[#0c1427]">
    <div
      aria-hidden
      className={`absolute -top-8 -left-8 h-24 w-24 rounded-full opacity-20 blur-2xl ${gradient}`}
    />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="truncate text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ${gradient}`}
      >
        <span className="material-symbols-outlined text-[24px] text-white">
          {icon}
        </span>
      </div>
    </div>
  </div>
);

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  };
  isLoading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-[#172036] dark:bg-[#0c1427]"
            >
              <div className="mb-3 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  const primaryCards: StatsCardProps[] = [
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers.toLocaleString(),
      icon: "group",
      gradient: "from-blue-500 to-blue-600",
      subtitle: "عملاء مسجّلون",
    },
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts.toLocaleString(),
      icon: "restaurant_menu",
      gradient: "from-purple-500 to-purple-600",
      subtitle: "في القائمة",
    },
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders.toLocaleString(),
      icon: "shopping_cart",
      gradient: "from-orange-500 to-orange-600",
      subtitle: "جميع الطلبات",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ج.م`,
      icon: "payments",
      gradient: "from-green-500 to-emerald-600",
      subtitle: "من الطلبات المكتملة",
    },
  ];

  const secondaryMetrics = [
    {
      label: "طلبات نشطة",
      value: stats.activeOrders,
      icon: "pending_actions",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: "مكتملة",
      value: stats.completedOrders,
      icon: "check_circle",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      label: "ملغاة",
      value: stats.cancelledOrders,
      icon: "cancel",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "متوسط الطلب",
      value: `${stats.averageOrderValue.toFixed(0)} ج.م`,
      icon: "account_balance_wallet",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {secondaryMetrics.map((metric) => (
          <div
            key={metric.label}
            className={`flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 dark:border-[#172036] ${metric.bg}`}
          >
            <span className={`material-symbols-outlined text-[22px] ${metric.color}`}>
              {metric.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {metric.label}
              </p>
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
