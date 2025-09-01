"use client";

import React from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col">
      <header className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between text-white">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
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
            </motion.div>
            <div>
            <h1 className="text-2xl font-extrabold text-white drop-shadow-lg">
  استطلاع رضا العملاء
</h1>
              <p className="text-sm opacity-90">شاركنا رأيك لتحسين تجربتك</p>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:block bg-white text-red-600 px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            تقييم سريع الآن
          </motion.div>
        </div>
      </header>

      <motion.main
        className="flex-1 py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto">
          <FeedbackSurvey branchId={branchId} />
        </div>
      </motion.main>

      <footer className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white mt-8 shadow-inner">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            © 2025 نظام تقييم الفروع. جميع الحقوق محفوظة.
          </motion.p>
          <motion.p
            className="mt-1 opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            تم تطوير هذا النظام لتحسين جودة الخدمة
          </motion.p>

         
        </div>
      </footer>
    </div>
  );
}
