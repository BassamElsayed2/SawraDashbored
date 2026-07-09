"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-url";

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

const RANK_STYLES = [
  "from-yellow-400 to-orange-500",
  "from-gray-300 to-gray-400",
  "from-amber-600 to-amber-700",
];

const TopProducts: React.FC<TopProductsProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#172036] dark:bg-[#0c1427]">
        <div className="mb-6 h-6 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl p-2">
              <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#172036] dark:bg-[#0c1427]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <span className="material-symbols-outlined text-primary-500">
            trending_up
          </span>
          الأكثر مبيعاً
        </h2>
        <Link
          href="/dashboard/products/"
          className="text-sm font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
        >
          كل المنتجات
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="py-10 text-center">
          <span className="material-symbols-outlined mb-3 block text-5xl text-gray-300 dark:text-gray-600">
            inventory_2
          </span>
          <p className="text-gray-500 dark:text-gray-400">لا توجد بيانات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white shadow ${
                  RANK_STYLES[index] || "from-primary-500 to-primary-600"
                }`}
              >
                {index + 1}
              </div>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-[#172036]">
                <Image
                  src={getImageUrl(product.image_url)}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-white">
                  {product.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      shopping_bag
                    </span>
                    {product.orders_count} مبيعة
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {product.total_revenue.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
