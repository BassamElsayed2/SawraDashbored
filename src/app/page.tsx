"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import DarkMode from "@/components/Authentication/DarkMode";
import SignInForm from "@/components/Authentication/SignInForm";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showError, setShowError] = useState(error === "unauthorized");
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (error === "unauthorized") {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        router.replace("/");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-[#0a0e19] dark:via-[#0c1427] dark:to-[#0a0e19]">
        <div className="text-center">
          <div className="relative mx-auto h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary-400/30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-primary-500/30">
              <svg
                className="h-6 w-6 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-5 font-medium text-gray-600 dark:text-gray-400">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DarkMode />
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 z-50 mx-4 w-full max-w-md -translate-x-1/2 rounded-2xl border border-danger-200 bg-white px-5 py-4 shadow-xl dark:border-danger-800 dark:bg-[#0c1427]"
          >
            <button
              onClick={() => {
                setShowError(false);
                router.replace("/");
              }}
              className="absolute top-3 text-danger-500 transition-colors hover:text-danger-700 ltr:right-3 rtl:left-3 dark:hover:text-danger-300"
              aria-label="إغلاق"
            >
              <i className="material-symbols-outlined text-[20px]">close</i>
            </button>
            <div className="flex items-start gap-3 pe-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                <i className="material-symbols-outlined">block</i>
              </span>
              <div>
                <p className="mb-1 font-bold text-danger-700 dark:text-danger-300">
                  وصول غير مصرح به
                </p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم. هذه اللوحة
                  مخصصة للمسؤولين فقط.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SignInForm />
    </>
  );
}
