"use client";

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  textColor: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  textColor,
  subtitle,
  trend,
}) => {
  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-xl shadow-lg`}>
          <span className="material-symbols-outlined text-white text-2xl">
            {icon}
          </span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-3xl font-bold ${textColor} dark:text-white`}>
          {value}
        </p>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {trend.isPositive ? "trending_up" : "trending_down"}
            </span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  const statsCards: StatsCardProps[] = [
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers.toLocaleString(),
      icon: "group",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      subtitle: "عملاء مسجلين",
    },
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts.toLocaleString(),
      icon: "restaurant_menu",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      subtitle: "منتجات متاحة",
    },
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders.toLocaleString(),
      icon: "shopping_cart",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      subtitle: "جميع الطلبات",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ج.م`,
      icon: "payments",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-600",
      subtitle: "من الطلبات المكتملة",
    },
    {
      title: "الطلبات النشطة",
      value: stats.activeOrders.toLocaleString(),
      icon: "pending_actions",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600",
      subtitle: "قيد التنفيذ",
    },
    {
      title: "الطلبات المكتملة",
      value: stats.completedOrders.toLocaleString(),
      icon: "check_circle",
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      textColor: "text-teal-600",
      subtitle: "تم التسليم بنجاح",
    },
    {
      title: "الطلبات الملغاة",
      value: stats.cancelledOrders.toLocaleString(),
      icon: "cancel",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      textColor: "text-red-600",
      subtitle: "طلبات ملغاة",
    },
    {
      title: "متوسط قيمة الطلب",
      value: `${stats.averageOrderValue.toFixed(2)} ج.م`,
      icon: "account_balance_wallet",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600",
      subtitle: "للطلبات المكتملة",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
};

export default DashboardStats;
