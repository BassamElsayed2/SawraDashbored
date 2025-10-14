"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // إخفاء رسالة الخطأ بعد 10 ثواني
  useEffect(() => {
    if (error === "unauthorized") {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        // إزالة معامل الخطأ من URL
        router.replace("/");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DarkMode />
      {showError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-6 py-4 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fade-in">
          <button
            onClick={() => {
              setShowError(false);
              router.replace("/");
            }}
            className="absolute top-2 left-2 rtl:right-2 rtl:left-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex items-start gap-3">
            <div className="text-3xl">🚫</div>
            <div className="flex-1">
              <p className="font-bold text-lg mb-2">وصول غير مصرح به</p>
              <p className="text-sm leading-relaxed">
                عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم. هذه اللوحة مخصصة
                للمسؤولين فقط.
              </p>
              <p className="text-xs mt-2 opacity-75">
                إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.
              </p>
            </div>
          </div>
        </div>
      )}
      <SignInForm />
    </>
  );
}
