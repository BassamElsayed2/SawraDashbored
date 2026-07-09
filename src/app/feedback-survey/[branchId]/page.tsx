"use client";

import React, { useState } from "react";
import FeedbackSurvey from "../../../components/FeedbackSurvey";

interface FeedbackSurveyPageProps {
  params: Promise<{
    branchId: string;
  }>;
}

export default function FeedbackSurveyPage({ params }: FeedbackSurveyPageProps) {
  const { branchId } = React.use(params);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col">
      <header className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-red-600"
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
            <div>
              <p className="text-3xl font-extrabold text-white drop-shadow-lg">
                استطلاع رضا العملاء
              </p>
              <p className="text-sm opacity-90">شاركنا رأيك لتحسين تجربتك</p>
            </div>
          </div>

          <div
            className="hidden md:block bg-white text-red-600 px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            تقييم سريع الآن
          </div>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-red-600 mb-4">
              شكراً على اهتمامك!
            </h2>
            <p className="text-gray-600 mb-6">
              من أجل رضاكم وتلبية طلباتكم ورغبتكم على أكمل وجه، نأمل التكرم بملئ التقييم.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <FeedbackSurvey branchId={branchId} />
        </div>
      </main>

      <footer className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white mt-8 shadow-inner">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm">
          <p>© 2025 نظام تقييم الفروع. جميع الحقوق محفوظة.</p>
          <p className="mt-1 opacity-90">
            تم تطوير هذا النظام لتحسين جودة الخدمة
          </p>
        </div>
      </footer>
    </div>
  );
}
