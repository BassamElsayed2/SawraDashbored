"use client";

import React from "react";
import Link from "next/link";import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";

interface WelcomeProps {
  totalProducts?: number;
  totalOrders?: number;
  activeOrders?: number;
  totalRevenue?: number;
  isLoading?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "مساء الخير";
  return "مساء الخير";
}

function formatDate(): string {
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

const Welcome: React.FC<WelcomeProps> = ({
  totalProducts = 0,
  totalOrders = 0,
  activeOrders = 0,
  totalRevenue = 0,
  isLoading,
}) => {
  const { data: profile } = useAdminProfile();
  const name = profile?.full_name || "المسؤول";

  const highlights = [
    {
      label: "المنتجات",
      value: totalProducts,
      icon: "restaurant_menu",
    },
    {
      label: "إجمالي الطلبات",
      value: totalOrders,
      icon: "receipt_long",
    },
    {
      label: "طلبات نشطة",
      value: activeOrders,
      icon: "pending_actions",
    },
    {
      label: "الإيرادات",
      value: `${totalRevenue.toLocaleString()} ج.م`,
      icon: "payments",
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900 p-6 shadow-xl shadow-primary-900/20 md:p-8 dark:border-primary-800/40"
    >      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl"
      />

      <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-2 text-sm font-medium text-primary-200">
            {formatDate()}
          </p>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px]">
              waving_hand
            </span>
            {getGreeting()}، {name}
          </span>
          <h1 className="mb-2 text-2xl font-bold leading-tight text-white! md:text-3xl">
            لوحة تحكم المطعم
          </h1>
          <p className="mb-6 max-w-lg text-sm leading-relaxed text-primary-100/90 md:text-base">
            نظرة شاملة على أداء مطعمك — الطلبات، المبيعات، والمنتجات في مكان
            واحد.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-md transition hover:bg-primary-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                receipt_long
              </span>
              عرض الطلبات
            </Link>
            <Link
              href="/dashboard/products/create/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              إضافة منتج
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
            >              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary-200">
                  {item.icon}
                </span>
                <span className="text-xs font-medium text-primary-200">
                  {item.label}
                </span>
              </div>
              {isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-white/20" />
              ) : (
                <p className="text-xl font-bold text-white">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Welcome;
