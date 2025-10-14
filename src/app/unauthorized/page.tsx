"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to home after 10 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e19] px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            وصول غير مصرح به
          </h1>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم. هذه اللوحة مخصصة
            للمسؤولين فقط.
          </p>

          {/* Additional Info */}
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-md p-4 mb-6">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مسؤول النظام للحصول على
              الصلاحيات المناسبة.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block w-full py-3 px-4 bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-md transition-colors"
            >
              العودة إلى الصفحة الرئيسية
            </Link>

            <button
              onClick={() => router.back()}
              className="inline-block w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md transition-colors"
            >
              العودة للصفحة السابقة
            </button>
          </div>

          {/* Auto redirect notice */}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
            سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال 10 ثوانٍ
          </p>
        </div>
      </div>
    </div>
  );
}
