"use client";

import React from "react";
import Image from "next/image";

interface TopProduct {
  id: string;
  title: string;
  image_url: string;
  orders_count: number;
  total_revenue: number;
}

interface TopProductsProps {
  products: TopProduct[];
  isLoading?: boolean;
}

const TopProducts: React.FC<TopProductsProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          المنتجات الأكثر طلباً
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          المنتجات الأكثر طلباً
        </h2>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
            inventory_2
          </span>
          <p className="text-gray-500 dark:text-gray-400">
            لا توجد بيانات متاحة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-500">
            trending_up
          </span>
          المنتجات الأكثر مبيعاً
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          أعلى {products.length} منتجات
        </span>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg">
              {index + 1}
            </div>
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
              <Image
                src={product.image_url || "/placeholder.jpg"}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                {product.title}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    inventory_2
                  </span>
                  {product.orders_count} وحدة مباعة
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    payments
                  </span>
                  {product.total_revenue.toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
