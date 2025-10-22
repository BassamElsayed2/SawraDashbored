"use client";

import React from "react";

interface OrdersChartProps {
  data: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    delivering: number;
    delivered: number;
    cancelled: number;
  };
  isLoading?: boolean;
}

const OrdersChart: React.FC<OrdersChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  const total =
    data.pending +
    data.confirmed +
    data.preparing +
    data.ready +
    data.delivering +
    data.delivered +
    data.cancelled;

  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const chartData = [
    {
      label: "تم التوصيل",
      value: data.delivered,
      percentage: getPercentage(data.delivered),
      color: "bg-green-500",
    },
    {
      label: "قيد التوصيل",
      value: data.delivering,
      percentage: getPercentage(data.delivering),
      color: "bg-indigo-500",
    },
    {
      label: "قيد التحضير",
      value: data.preparing,
      percentage: getPercentage(data.preparing),
      color: "bg-purple-500",
    },
    {
      label: "تم الدفع",
      value: data.confirmed,
      percentage: getPercentage(data.confirmed),
      color: "bg-blue-500",
    },
    {
      label: "ملغي",
      value: data.cancelled,
      percentage: getPercentage(data.cancelled),
      color: "bg-red-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-orange-500">
          bar_chart
        </span>
        توزيع حالات الطلبات
      </h2>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {item.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            إجمالي الطلبات
          </span>
          <span className="text-2xl font-bold text-orange-500">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrdersChart;
