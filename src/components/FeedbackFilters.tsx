"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { FeedbackFilters, Branch } from "../types/feedback";

interface FeedbackFiltersComponentProps {
  filters: FeedbackFilters;
  branches: Branch[];
  onFilterChange: (filters: Partial<FeedbackFilters>) => void;
  isLoading?: boolean;
}

interface FilterFormData {
  branchId?: string;
  rating?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const FeedbackFiltersComponent: React.FC<
  FeedbackFiltersComponentProps
> = ({ filters, branches, onFilterChange, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { control, reset, watch } = useForm<FilterFormData>({
    defaultValues: {
      branchId: filters.branchId || "",
      rating: filters.rating || undefined,
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      search: filters.search || "",
    },
  });

  const watchedValues = watch();

  // Apply filters on form change (only for search to avoid page resets)
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Only apply search filter automatically to avoid page resets
      if (watchedValues.search !== filters.search) {
        onFilterChange({
          search: watchedValues.search || undefined,
        });
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedValues.search, filters.search, onFilterChange]);

  const handleReset = () => {
    reset();
    onFilterChange({
      branchId: undefined,
      rating: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
  };

  const presetDateRanges = [
    {
      label: "اليوم",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    {
      label: "هذا الأسبوع",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    {
      label: "هذا الشهر",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    {
      label: "الشهر الماضي",
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 1,
        1
      )
        .toISOString()
        .split("T")[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        .toISOString()
        .split("T")[0],
    },
  ];

  const ratingOptions = [
    { value: 4, label: "ممتاز (4)" },
    { value: 3, label: "جيد (3)" },
    { value: 2, label: "مقبول (2)" },
    { value: 1, label: "ضعيف (1)" },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            dir="rtl"
          >
            البحث
          </label>
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="اسم العميل أو رقم الهاتف..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                dir="rtl"
              />
            )}
          />
        </div>

        {/* Branch Filter */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            dir="rtl"
          >
            الفرع
          </label>
          <Controller
            name="branchId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onFilterChange({
                    branchId: e.target.value || undefined,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                dir="rtl"
              >
                <option value="">جميع الفروع</option>
                {branches
                  .filter((branch) => branch.id)
                  .map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name_ar || branch.name_en}
                    </option>
                  ))}
              </select>
            )}
          />
        </div>

        {/* Rating Filter */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            dir="rtl"
          >
            التقييم
          </label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onFilterChange({
                    rating: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                dir="rtl"
              >
                <option value="">جميع التقييمات</option>
                {ratingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        {/* Date Range Toggle */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white flex items-center justify-between"
            dir="rtl"
          >
            <span>نطاق التاريخ</span>
            <i className="material-symbols-outlined text-sm">
              {isExpanded ? "expand_less" : "expand_more"}
            </i>
          </button>
        </div>
      </div>

      {/* Expanded Date Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                dir="rtl"
              >
                من تاريخ
              </label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    onChange={(e) => {
                      field.onChange(e);
                      onFilterChange({
                        startDate: e.target.value || undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                )}
              />
            </div>

            {/* End Date */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                dir="rtl"
              >
                إلى تاريخ
              </label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    onChange={(e) => {
                      field.onChange(e);
                      onFilterChange({
                        endDate: e.target.value || undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                )}
              />
            </div>

            {/* Preset Date Ranges */}
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                dir="rtl"
              >
                نطاقات سريعة
              </label>
              <div className="flex flex-wrap gap-2">
                {presetDateRanges.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      reset({
                        ...watchedValues,
                        startDate: preset.startDate,
                        endDate: preset.endDate,
                      });
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    dir="rtl"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          dir="rtl"
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
};
