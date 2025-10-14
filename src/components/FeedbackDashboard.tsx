"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiCustomerFeedback } from "@/services/apiCustomerFeedback";
import { apiBranches } from "@/services/apiBranches";
import { FeedbackFilters, FeedbackWithRatings } from "../types/feedback";
import { FeedbackTable } from "./FeedbackTable";
import { FeedbackFiltersComponent as FiltersComponent } from "./FeedbackFilters";
import { FeedbackStats } from "./FeedbackStats";
import { FeedbackDetailModal } from "./FeedbackDetailModal";
import { isFeatureEnabled } from "../lib/feature-flags";

export const FeedbackDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FeedbackFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackWithRatings | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check if feature is enabled
  // Fetch feedback data
  const {
    data: feedbackData,
    isLoading: feedbackLoading,
    error: feedbackError,
    refetch: refetchFeedback,
  } = useQuery({
    queryKey: [
      "feedback",
      filters.page,
      filters.limit,
      filters.branchId,
      filters.rating,
      filters.startDate,
      filters.endDate,
      filters.search,
    ],
    queryFn: () => apiCustomerFeedback.getFeedback(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch feedback analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["feedback-analytics", filters],
    queryFn: () => apiCustomerFeedback.getFeedbackAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch branches for filters
  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiBranches.getBranches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Handle filter changes
  const handleFilterChange = React.useCallback(
    (newFilters: Partial<FeedbackFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1, // Reset to first page when filters change
      }));
    },
    []
  );

  // Handle page change
  const handlePageChange = React.useCallback((page: number) => {
    if (page < 1) return;
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Check if feature is enabled
  if (!isFeatureEnabled("ENABLE_FEEDBACK_DASHBOARD")) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800" dir="rtl">
              لوحة تحكم التقييمات غير متاحة
            </h3>
            <div className="mt-2 text-sm text-yellow-700" dir="rtl">
              <p>هذه الميزة غير مفعلة حالياً. يرجى المحاولة لاحقاً.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle feedback selection
  const handleFeedbackSelect = (feedback: FeedbackWithRatings) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedFeedback(null);
  };

  // Handle feedback deletion
  const handleFeedbackDelete = async (feedbackId: string) => {
    try {
      await apiCustomerFeedback.deleteFeedback(feedbackId);
      refetchFeedback();
      if (selectedFeedback?.id === feedbackId) {
        handleModalClose();
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  if (feedbackError || branchesError || analyticsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800" dir="rtl">
                خطأ في تحميل البيانات
              </h3>
              <div className="mt-2 text-sm text-red-700" dir="rtl">
                <p>
                  حدث خطأ أثناء تحميل بيانات التقييمات. يرجى المحاولة مرة أخرى.
                </p>
                {feedbackError && (
                  <p className="mt-2 text-xs">
                    تفاصيل الخطأ: {feedbackError.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <FeedbackStats
        feedbackData={feedbackData}
        analyticsData={analyticsData}
        isLoading={feedbackLoading || analyticsLoading}
      />

      {/* Filters */}
      <div className=" rounded-lg shadow-sm border p-6">
        <FiltersComponent
          filters={filters}
          branches={branches || []}
          onFilterChange={handleFilterChange}
          isLoading={branchesLoading}
        />
      </div>

      {/* Total Count */}
      <div className="flex justify-end items-center">
        <div className="text-sm text-gray-600" dir="rtl">
          إجمالي التقييمات: {feedbackData?.total || 0}
        </div>
      </div>

      {/* Feedback Table */}
      <div className=" rounded-lg shadow-sm border">
        <FeedbackTable
          feedback={feedbackData?.feedback || []}
          total={feedbackData?.total || 0}
          currentPage={filters.page || 1}
          pageSize={filters.limit || 10}
          isLoading={feedbackLoading}
          onPageChange={handlePageChange}
          onFeedbackSelect={handleFeedbackSelect}
          onFeedbackDelete={handleFeedbackDelete}
        />
      </div>

      {/* Feedback Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          isOpen={showDetailModal}
          onClose={handleModalClose}
          onDelete={handleFeedbackDelete}
        />
      )}
    </div>
  );
};
