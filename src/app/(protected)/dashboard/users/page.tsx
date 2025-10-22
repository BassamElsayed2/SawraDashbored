"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAdmins, getAllUsers } from "@/services/apiUsers";
import UsersTable from "@/components/UsersTable";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");

  // Fetch admins
  const {
    data: admins,
    isLoading: adminsLoading,
    error: adminsError,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: getAllAdmins,
  });

  // Fetch users
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          إدارة المستخدمين
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض وإدارة المستخدمين والمدراء في النظام
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "admin"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              المدراء
              {admins && (
                <span className="mr-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {admins.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "user"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              المستخدمين
              {users && (
                <span className="mr-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {users.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Error Messages */}
      {adminsError && activeTab === "admin" && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            حدث خطأ في تحميل بيانات المدراء
          </p>
        </div>
      )}

      {usersError && activeTab === "user" && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            حدث خطأ في تحميل بيانات المستخدمين
          </p>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Stats Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي المدراء
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {adminsLoading ? "..." : admins?.length || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي المستخدمين
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {usersLoading ? "..." : users?.length || 0}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                الإجمالي الكلي
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {adminsLoading || usersLoading
                  ? "..."
                  : (admins?.length || 0) + (users?.length || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {activeTab === "admin" ? (
            <UsersTable
              users={admins || []}
              type="admin"
              isLoading={adminsLoading}
            />
          ) : (
            <UsersTable
              users={users || []}
              type="user"
              isLoading={usersLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
