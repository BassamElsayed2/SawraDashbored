"use client";

import React, { useState, useEffect } from "react";

interface OrdersFiltersProps {
  filters: {
    status?: string;
    branch_id?: string;
    from_date?: string;
    to_date?: string;
    order_id?: string;
    customer_name?: string;
  };
  onFilterChange: (filters: Record<string, unknown>) => void;
  branches?: Array<{ id?: string; name_ar: string }>;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  filters,
  onFilterChange,
  branches = [],
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.order_id || "");
  const [customerNameSearch, setCustomerNameSearch] = useState(
    filters.customer_name || ""
  );

  // Debounce order ID search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...filters,
        order_id: searchTerm || undefined,
      });
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Debounce customer name search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...filters,
        customer_name: customerNameSearch || undefined,
      });
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerNameSearch]);

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setCustomerNameSearch("");
    onFilterChange({});
  };

  const handleTogglePendingPayment = () => {
    if (filters.status === "pending_payment") {
      // إذا كان مفعل، قم بإلغاء التفعيل
      handleFilterChange("status", "");
    } else {
      // إذا لم يكن مفعل، قم بتفعيله
      handleFilterChange("status", "pending_payment");
    }
  };

  const statusOptions = [
    { value: "", label: "جميع الحالات" },
    { value: "pending", label: "قيد الانتظار" },
    { value: "pending_payment", label: "بانتظار الدفع" },
    { value: "confirmed", label: "مؤكد" },
    { value: "preparing", label: "قيد التحضير" },
    { value: "ready", label: "جاهز" },
    { value: "delivering", label: "قيد التوصيل" },
    { value: "delivered", label: "تم التوصيل" },
    { value: "cancelled", label: "ملغى" },
  ];

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 shadow mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          تصفية الطلبات
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePendingPayment}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${
              filters.status === "pending_payment"
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              pending_actions
            </span>
            بانتظار الدفع
          </button>
          <button
            onClick={handleReset}
            className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search by Order ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            رقم الطلب
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم الطلب..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Search by Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            اسم العميل
          </label>
          <input
            type="text"
            value={customerNameSearch}
            onChange={(e) => setCustomerNameSearch(e.target.value)}
            placeholder="ابحث باسم العميل..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

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
              {branches
                .filter((branch) => branch.id)
                .map((branch) => (
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
