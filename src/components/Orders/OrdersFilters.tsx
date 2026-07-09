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
  totalResults?: number;
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  filters,
  onFilterChange,
  branches = [],
  totalResults,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.order_id || "");
  const [customerNameSearch, setCustomerNameSearch] = useState(
    filters.customer_name || ""
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...filters,
        order_id: searchTerm || undefined,
      });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        ...filters,
        customer_name: customerNameSearch || undefined,
      });
    }, 500);
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

  const activeFilterCount = [
    filters.status,
    filters.branch_id,
    filters.from_date,
    filters.to_date,
    filters.order_id,
    filters.customer_name,
  ].filter(Boolean).length;

  const statusOptions = [
    { value: "", label: "جميع الحالات" },
    { value: "pending", label: "قيد الانتظار" },
    { value: "pending_payment", label: "بانتظار الدفع" },
    { value: "confirmed", label: "تم الدفع" },
    { value: "preparing", label: "قيد التحضير" },
    { value: "ready", label: "جاهز" },
    { value: "delivering", label: "قيد التوصيل" },
    { value: "delivered", label: "تم التوصيل" },
    { value: "cancelled", label: "ملغي" },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[#172036] dark:bg-[#0c1427]">
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 -translate-y-1/2 text-[20px] text-gray-400 ltr:left-3 rtl:right-3">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم الطلب..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-900 transition focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white ltr:pl-10 ltr:pr-4 rtl:pl-4 rtl:pr-10"
            />
          </div>
          <div className="relative flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 -translate-y-1/2 text-[20px] text-gray-400 ltr:left-3 rtl:right-3">
              person_search
            </span>
            <input
              type="text"
              value={customerNameSearch}
              onChange={(e) => setCustomerNameSearch(e.target.value)}
              placeholder="ابحث باسم العميل..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-900 transition focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white ltr:pl-10 ltr:pr-4 rtl:pl-4 rtl:pr-10"
            />
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-[#172036] dark:text-gray-300 dark:hover:bg-gray-800/40"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            فلاتر متقدمة
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary-500 px-1.5 py-0.5 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {expanded && (
          <div className="overflow-hidden">
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 dark:border-[#172036] sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    الحالة
                  </label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {branches.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      الفرع
                    </label>
                    <select
                      value={filters.branch_id || ""}
                      onChange={(e) =>
                        handleFilterChange("branch_id", e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white"
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

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    من تاريخ
                  </label>
                  <input
                    type="date"
                    value={filters.from_date || ""}
                    onChange={(e) =>
                      handleFilterChange("from_date", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    إلى تاريخ
                  </label>
                  <input
                    type="date"
                    value={filters.to_date || ""}
                    onChange={(e) =>
                      handleFilterChange("to_date", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white"
                  />
                </div>
              </div>
          </div>
        )}

        {(activeFilterCount > 0 || totalResults !== undefined) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {totalResults !== undefined && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {totalResults} طلب
                </span>
              )}
              {activeFilterCount > 0 && (
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  {activeFilterCount} فلتر نشط
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400"
              >
                <span className="material-symbols-outlined text-[16px]">
                  filter_alt_off
                </span>
                مسح الفلاتر
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersFilters;
