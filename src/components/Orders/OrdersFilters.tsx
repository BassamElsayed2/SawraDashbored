"use client";

import React from "react";

interface OrdersFiltersProps {
  filters: {
    status?: string;
    delivery_type?: string;
    branch_id?: string;
    from_date?: string;
    to_date?: string;
  };
  onFilterChange: (filters: any) => void;
  branches?: Array<{ id: string; name_ar: string }>;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  filters,
  onFilterChange,
  branches = [],
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  const statusOptions = [
    { value: "", label: "جميع الحالات" },
    { value: "pending", label: "قيد الانتظار" },
    { value: "confirmed", label: "مؤكد" },
    { value: "preparing", label: "قيد التحضير" },
    { value: "ready", label: "جاهز" },
    { value: "delivering", label: "قيد التوصيل" },
    { value: "delivered", label: "تم التوصيل" },
    { value: "cancelled", label: "ملغى" },
  ];

  const deliveryTypeOptions = [
    { value: "", label: "جميع الأنواع" },
    { value: "delivery", label: "توصيل" },
    { value: "pickup", label: "استلام" },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          تصفية الطلبات
        </h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          إعادة تعيين
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الحالة
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نوع الطلب
          </label>
          <select
            value={filters.delivery_type || ""}
            onChange={(e) =>
              handleFilterChange("delivery_type", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {deliveryTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        {branches.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الفرع
            </label>
            <select
              value={filters.branch_id || ""}
              onChange={(e) => handleFilterChange("branch_id", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الفروع</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name_ar}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* From Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            من تاريخ
          </label>
          <input
            type="date"
            value={filters.from_date || ""}
            onChange={(e) => handleFilterChange("from_date", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            إلى تاريخ
          </label>
          <input
            type="date"
            value={filters.to_date || ""}
            onChange={(e) => handleFilterChange("to_date", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersFilters;
