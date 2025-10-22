"use client";

import React from "react";
import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const QuickActions: React.FC = () => {
  const actions: QuickAction[] = [
    {
      title: "إضافة منتج جديد",
      description: "أضف منتج جديد للقائمة",
      icon: "add_box",
      href: "/dashboard/news/create-news/",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "عرض الطلبات",
      description: "إدارة جميع الطلبات",
      icon: "receipt_long",
      href: "/dashboard/orders",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "إدارة المستخدمين",
      description: "عرض وإدارة العملاء",
      icon: "manage_accounts",
      href: "/dashboard/users",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "العروض الخاصة",
      description: "إنشاء وإدارة العروض",
      icon: "local_offer",
      href: "/dashboard/ads/create-combo-offer/",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-orange-500">bolt</span>
        إجراءات سريعة
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group relative overflow-hidden rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  {action.icon}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
