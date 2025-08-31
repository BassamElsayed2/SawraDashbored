"use client";

import React from "react";
import FeedbackSurvey from "../../../components/FeedbackSurvey";

interface FeedbackSurveyPageProps {
  params: Promise<{
    branchId: string;
  }>;
}

export default function FeedbackSurveyPage({
  params,
}: FeedbackSurveyPageProps) {
  const { branchId } = React.use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center ml-5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h1
                className="text-lg font-semibold text-gray-900 !mb-0"
                dir="rtl"
              >
                استطلاع رضا العملاء
              </h1>
            </div>
            <div className="text-xs text-gray-500" dir="rtl">
              تقييم سريع
            </div>
          </div>
        </div>
      </div>

      {/* Survey Component */}
      <div className="py-4">
        <FeedbackSurvey branchId={branchId} />
      </div>

      {/* Mobile-optimized footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="text-center text-xs text-gray-500" dir="rtl">
            <p>© 2025 نظام تقييم الفروع. جميع الحقوق محفوظة.</p>
            <p className="mt-1">تم تطوير هذا النظام لتحسين جودة الخدمة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
