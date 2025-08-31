"use client";

import React from "react";
import { FeedbackWithRatings, FeedbackAnalytics } from "../types/feedback";

interface FeedbackStatsProps {
  feedbackData?: {
    feedback: FeedbackWithRatings[];
    total: number;
  };
  analyticsData?: FeedbackAnalytics;
  isLoading?: boolean;
}

export const FeedbackStats: React.FC<FeedbackStatsProps> = ({
  feedbackData,
  analyticsData,
  isLoading = false,
}) => {
  const feedback = feedbackData?.feedback || [];
  const total = feedbackData?.total || 0;

  // Use analytics data if available, otherwise calculate from feedback
  const averageRating =
    analyticsData?.average_rating ||
    (feedback.length > 0
      ? feedback.reduce((sum, item) => sum + item.overall_rating, 0) /
        feedback.length
      : 0);

  const today = new Date();
  const todayFeedback = feedback.filter((item) => {
    const itemDate = new Date(item.created_at || "");
    return itemDate.toDateString() === today.toDateString();
  }).length;

  const thisWeekFeedback = feedback.filter((item) => {
    const itemDate = new Date(item.created_at || "");
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return itemDate >= weekAgo;
  }).length;

  const stats = [
    {
      title: "إجمالي التقييمات",
      value: analyticsData?.total_feedback || total,
      icon: "analytics",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    {
      title: "متوسط التقييم",
      value: averageRating.toFixed(1),
      icon: "star",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    {
      title: "تقييمات اليوم",
      value: todayFeedback,
      icon: "today",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    {
      title: "تقييمات الأسبوع",
      value: thisWeekFeedback,
      icon: "trending_up",
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[25px]">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md animate-pulse"
          >
            <div className="trezo-card-content">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[25px]">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="trezo-card-content">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm text-gray-600 dark:text-gray-400 mb-1"
                  dir="rtl"
                >
                  {stat.title}
                </p>
                <h3
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  dir="rtl"
                >
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <i className="material-symbols-outlined text-white text-xl">
                  {stat.icon}
                </i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
