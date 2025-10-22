"use client";

import React from "react";
import Image from "next/image";

interface BaseUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  joined_at: string | Date;
}

interface AdminUser extends BaseUser {
  role: string;
  job_title?: string;
  image_url?: string;
}

interface RegularUser extends BaseUser {
  phone_verified: boolean;
  email_verified: boolean;
  orders_count: number;
}

interface UsersTableProps {
  users: (AdminUser | RegularUser)[];
  type: "admin" | "user";
  isLoading?: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, type, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            جارٍ تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          لا توجد بيانات {type === "admin" ? "للمدراء" : "للمستخدمين"}
        </p>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {type === "admin" && (
              <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                الصورة
              </th>
            )}
            <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
              الاسم
            </th>
            <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
              البريد الإلكتروني
            </th>
            <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
              رقم الهاتف
            </th>
            {type === "admin" && (
              <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                الدور
              </th>
            )}
            {type === "user" && (
              <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                <div
                  className="flex items-center gap-2"
                  title="عدد الطلبات (ما عدا الملغي والـ الغير مكتملة الدفع)"
                >
                  عدد الطلبات
                  <svg
                    className="w-4 h-4 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </th>
            )}
            <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
              تاريخ الانضمام
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {type === "admin" && (
                <td className="py-4 px-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {(user as AdminUser).image_url ? (
                      <Image
                        src={
                          (user as AdminUser).image_url ||
                          "/placeholder-user.jpg"
                        }
                        alt={user.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </td>
              )}
              <td className="py-4 px-4">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {user.full_name || "غير محدد"}
                  </span>
                  {type === "admin" && (user as AdminUser).job_title && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {(user as AdminUser).job_title}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className="text-gray-700 dark:text-gray-300 text-left"
                    dir="ltr"
                  >
                    {user.email}
                  </span>
                  {type === "user" && (user as RegularUser).email_verified && (
                    <span className="text-green-500 text-xs">✓</span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className="text-gray-700 dark:text-gray-300 text-left"
                    dir="ltr"
                  >
                    {user.phone || "غير محدد"}
                  </span>
                  {type === "user" && (user as RegularUser).phone_verified && (
                    <span className="text-green-500 text-xs">✓</span>
                  )}
                </div>
              </td>
              {type === "admin" && (
                <td className="py-4 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      (user as AdminUser).role === "super_admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : (user as AdminUser).role === "admin"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {(user as AdminUser).role === "super_admin"
                      ? "مدير عام"
                      : (user as AdminUser).role === "admin"
                      ? "مدير"
                      : "مشرف"}
                  </span>
                </td>
              )}
              {type === "user" && (
                <td className="py-4 px-4">
                  <div
                    className="flex items-center gap-2"
                    title="عدد الطلبات (ما عدا الملغي والـ pending)"
                  >
                    <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {(user as RegularUser).orders_count || 0}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      طلب
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </td>
              )}
              <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                {formatDate(user.joined_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
