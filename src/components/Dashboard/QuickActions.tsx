"use client";

import React from "react";
import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
}

const QuickActions: React.FC = () => {
  const actions: QuickAction[] = [
    {
      title: "إضافة منتج",
      description: "منتج جديد للقائمة",
      icon: "add_box",
      href: "/dashboard/products/create/",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "الطلبات",
      description: "متابعة وإدارة الطلبات",
      icon: "receipt_long",
      href: "/dashboard/orders/",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "الفروع",
      description: "إدارة فروع المطعم",
      icon: "storefront",
      href: "/dashboard/branches/",
      gradient: "from-teal-500 to-teal-600",
    },
    {
      title: "التصنيفات",
      description: "تنظيم قائمة المنتجات",
      icon: "category",
      href: "/dashboard/products/categories/",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "العروض",
      description: "إنشاء عروض خاصة",
      icon: "local_offer",
      href: "/dashboard/ads/create-combo-offer/",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "المستخدمين",
      description: "إدارة العملاء والمسؤولين",
      icon: "manage_accounts",
      href: "/dashboard/users/",
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427]">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <span className="material-symbols-outlined text-primary-500">bolt</span>
        إجراءات سريعة
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <div key={action.href}>
            <Link
              href={action.href}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-center transition hover:border-primary-200 hover:bg-primary-50/50 hover:shadow-sm dark:border-[#172036] dark:bg-gray-800/30 dark:hover:border-primary-800 dark:hover:bg-primary-900/10"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition group-hover:scale-105 ${action.gradient}`}
              >
                <span className="material-symbols-outlined text-[22px] text-white">
                  {action.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 transition group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                  {action.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
