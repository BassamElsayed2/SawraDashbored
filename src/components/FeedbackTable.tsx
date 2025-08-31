"use client";

import React, { useState } from "react";
import { FeedbackWithRatings } from "../types/feedback";

interface FeedbackTableProps {
  feedback: FeedbackWithRatings[];
  total: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onFeedbackSelect: (feedback: FeedbackWithRatings) => void;
  onFeedbackDelete: (feedbackId: string) => void;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  feedback,
  total,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onFeedbackSelect,
  onFeedbackDelete,
}) => {
  const [sortField, setSortField] =
    useState<keyof FeedbackWithRatings>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof FeedbackWithRatings) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getRatingLabel = (rating: number): string => {
    const labels = {
      1: "ضعيف",
      2: "مقبول",
      3: "جيد",
      4: "ممتاز",
    };
    return labels[rating as keyof typeof labels] || "غير محدد";
  };

  const getRatingColor = (rating: number): string => {
    const colors = {
      1: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
      2: "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
      3: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
      4: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
    };
    return (
      colors[rating as keyof typeof colors] ||
      "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400" dir="rtl">
          <i className="material-symbols-outlined text-6xl mb-4 block">
            rate_review
          </i>
          <p className="text-lg font-medium">لا توجد تقييمات</p>
          <p className="text-sm">
            لم يتم العثور على أي تقييمات تطابق المعايير المحددة
          </p>
        </div>
      </div>
    );
  }

  // Sort feedback data
  const sortedFeedback = [...feedback].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("customer_name")}
                className="flex items-center gap-1 hover:text-orange-500 transition-colors"
              >
                اسم العميل
                {sortField === "customer_name" && (
                  <i className="material-symbols-outlined text-sm">
                    {sortDirection === "asc"
                      ? "arrow_upward"
                      : "arrow_downward"}
                  </i>
                )}
              </button>
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("branch_id")}
                className="flex items-center gap-1 hover:text-orange-500 transition-colors"
              >
                الفرع
                {sortField === "branch_id" && (
                  <i className="material-symbols-outlined text-sm">
                    {sortDirection === "asc"
                      ? "arrow_upward"
                      : "arrow_downward"}
                  </i>
                )}
              </button>
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("overall_rating")}
                className="flex items-center gap-1 hover:text-orange-500 transition-colors"
              >
                التقييم العام
                {sortField === "overall_rating" && (
                  <i className="material-symbols-outlined text-sm">
                    {sortDirection === "asc"
                      ? "arrow_upward"
                      : "arrow_downward"}
                  </i>
                )}
              </button>
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("created_at")}
                className="flex items-center gap-1 hover:text-orange-500 transition-colors"
              >
                تاريخ التقييم
                {sortField === "created_at" && (
                  <i className="material-symbols-outlined text-sm">
                    {sortDirection === "asc"
                      ? "arrow_upward"
                      : "arrow_downward"}
                  </i>
                )}
              </button>
            </th>
            <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFeedback.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => onFeedbackSelect(item)}
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.customer_name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.phone_number}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-gray-900 dark:text-white">
                  {item.branch?.name_ar || item.branch?.name_en || "غير محدد"}
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(
                    item.overall_rating
                  )}`}
                >
                  {item.overall_rating} ⭐ {getRatingLabel(item.overall_rating)}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(item.created_at || "").toLocaleDateString("ar-EG")}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedbackSelect(item);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="عرض التفاصيل"
                  >
                    <i className="material-symbols-outlined text-sm">
                      visibility
                    </i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
                        onFeedbackDelete(item.id || "");
                      }
                    }}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="حذف التقييم"
                  >
                    <i className="material-symbols-outlined text-sm">delete</i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300" dir="rtl">
            عرض {(currentPage - 1) * pageSize + 1} إلى{" "}
            {Math.min(currentPage * pageSize, total)} من {total} تقييم
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              السابق
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
