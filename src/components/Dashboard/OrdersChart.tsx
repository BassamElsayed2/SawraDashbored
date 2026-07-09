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

const CHART_COLORS = [
  { hex: "#22c55e", tailwind: "bg-green-500" },
  { hex: "#6366f1", tailwind: "bg-indigo-500" },
  { hex: "#06b6d4", tailwind: "bg-cyan-500" },
  { hex: "#a855f7", tailwind: "bg-purple-500" },
  { hex: "#3b82f6", tailwind: "bg-blue-500" },
  { hex: "#eab308", tailwind: "bg-yellow-500" },
  { hex: "#ef4444", tailwind: "bg-red-500" },
];

const OrdersChart: React.FC<OrdersChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#172036] dark:bg-[#0c1427]">
        <div className="mb-6 h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex gap-6">
          <div className="h-44 w-44 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
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

  const getPercentage = (value: number) =>
    total === 0 ? 0 : (value / total) * 100;

  const chartData = [
    { label: "تم التوصيل", value: data.delivered, color: CHART_COLORS[0] },
    { label: "قيد التوصيل", value: data.delivering, color: CHART_COLORS[1] },
    { label: "جاهز", value: data.ready, color: CHART_COLORS[2] },
    { label: "قيد التحضير", value: data.preparing, color: CHART_COLORS[3] },
    { label: "تم الدفع", value: data.confirmed, color: CHART_COLORS[4] },
    { label: "قيد الانتظار", value: data.pending, color: CHART_COLORS[5] },
    { label: "ملغي", value: data.cancelled, color: CHART_COLORS[6] },
  ].filter((item) => item.value > 0);

  const donutGradient =
    total === 0
      ? "conic-gradient(#e5e7eb 0deg 360deg)"
      : (() => {
          let angle = 0;
          const segments = chartData.map((item) => {
            const pct = getPercentage(item.value);
            const start = angle;
            angle += pct * 3.6;
            return `${item.color.hex} ${start}deg ${angle}deg`;
          });
          return `conic-gradient(${segments.join(", ")})`;
        })();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427]">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <span className="material-symbols-outlined text-primary-500">donut_large</span>
        توزيع حالات الطلبات
      </h2>

      {total === 0 ? (
        <div className="py-12 text-center">
          <span className="material-symbols-outlined mb-3 block text-5xl text-gray-300 dark:text-gray-600">
            bar_chart
          </span>
          <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات لعرضها</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <div
              className="h-44 w-44 rounded-full"
              style={{ background: donutGradient }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-[#0c1427]">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  طلب
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3">
            {chartData.map((item) => {
              const pct = getPercentage(item.value).toFixed(1);
              return (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.color.tailwind}`}
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.value}
                      </span>
                      <span className="text-xs text-gray-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.color.tailwind}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersChart;
