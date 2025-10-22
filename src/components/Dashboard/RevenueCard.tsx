"use client";

import React from "react";

interface RevenueCardProps {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders?: number;
  isLoading?: boolean;
}

const RevenueCard: React.FC<RevenueCardProps> = ({
  totalRevenue,
  averageOrderValue,
  totalOrders,
  completedOrders = 0,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const revenuePerOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // حساب معدل إتمام الطلبات
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // تحديد اللون حسب المعدل
  const getCompletionColor = () => {
    if (completionRate >= 80) return "text-green-300";
    if (completionRate >= 60) return "text-yellow-300";
    return "text-orange-300";
  };

  const getCompletionIcon = () => {
    if (completionRate >= 80) return "trending_up";
    if (completionRate >= 60) return "trending_flat";
    return "trending_down";
  };

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow text-white mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-3xl ">
            account_balance_wallet
          </span>
          ملخص الإيرادات
        </h2>
      </div>

      <div className="space-y-6">
        {/* إجمالي الإيرادات */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/80 text-sm mb-2 ">إجمالي الإيرادات</p>
          <p className="text-3xl font-bold">
            {totalRevenue.toLocaleString()} ج.م
          </p>
          <p className="text-white/70 text-xs mt-1">
            من {totalOrders.toLocaleString()} طلب مكتمل
          </p>
        </div>

        {/* متوسط قيمة الطلب */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white/80 text-xs mb-2">متوسط قيمة الطلب</p>
            <p className="text-xl font-bold">
              {averageOrderValue.toFixed(2)} ج.م
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white/80 text-xs mb-2">متوسط الإيراد لكل طلب</p>
            <p className="text-xl font-bold">
              {revenuePerOrder.toFixed(2)} ج.م
            </p>
          </div>
        </div>

        {/* مؤشرات إضافية */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">
                {getCompletionIcon()}
              </span>
              <div>
                <p className="text-white/80 text-xs">معدل إتمام الطلبات</p>
                <p className="text-sm font-semibold">
                  {completedOrders.toLocaleString()} من{" "}
                  {totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getCompletionColor()}`}>
                {completionRate.toFixed(1)}%
              </p>
              <p className="text-white/70 text-xs">
                {completionRate >= 80
                  ? "أداء ممتاز"
                  : completionRate >= 60
                  ? "أداء جيد"
                  : "يحتاج تحسين"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;
