"use client";

import React, { useState } from "react";
import FeedbackSurvey from "../../../components/FeedbackSurvey";
import { motion, AnimatePresence } from "framer-motion";

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
              <p className="text-3xl font-extrabold text-white drop-shadow-lg">
                استطلاع رضا العملاء
              </p>
              <p className="text-sm opacity-90">شاركنا رأيك لتحسين تجربتك</p>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:block bg-white text-red-600 px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setIsOpen(true)}
          >
            تقييم سريع الآن
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
