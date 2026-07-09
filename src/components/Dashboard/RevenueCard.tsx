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
      <div className="animate-pulse rounded-2xl bg-gradient-to-br from-primary-600 to-purple-800 p-6">
        <div className="mb-6 h-6 w-1/2 rounded bg-white/20" />
        <div className="space-y-4">
          <div className="h-24 rounded-xl bg-white/20" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-white/20" />
            <div className="h-16 rounded-xl bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  const performanceLabel =
    completionRate >= 80
      ? "أداء ممتاز"
      : completionRate >= 60
        ? "أداء جيد"
        : "يحتاج تحسين";

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900 p-6 text-white shadow-xl shadow-primary-900/20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative">
        <div className="mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[28px] text-primary-200">
            account_balance_wallet
          </span>
          <h2 className="text-lg font-bold">ملخص الإيرادات</h2>
        </div>

        <div className="mb-5 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <p className="mb-1 text-sm text-primary-200">إجمالي الإيرادات</p>
          <p className="text-3xl font-bold tracking-tight">
            {totalRevenue.toLocaleString()}{" "}
            <span className="text-lg font-medium text-primary-200">ج.م</span>
          </p>
          <p className="mt-1 text-xs text-primary-200/80">
            من {completedOrders.toLocaleString()} طلب مكتمل
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <p className="mb-1 text-[11px] text-primary-200">متوسط الطلب</p>
            <p className="text-lg font-bold">
              {averageOrderValue.toFixed(0)} ج.م
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
            <p className="mb-1 text-[11px] text-primary-200">إجمالي الطلبات</p>
            <p className="text-lg font-bold">{totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-primary-200">معدل الإتمام</span>
            <span className="text-lg font-bold">{completionRate.toFixed(0)}%</span>
          </div>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-primary-200/80">{performanceLabel}</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;
