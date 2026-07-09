"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllAdmins,
  getAllUsers,
  setCustomerStatus,
  setAdminStatus,
  deleteCustomer,
  deleteAdmin,
  updateAdminRole,
} from "@/services/apiUsers";
import { getAllRoles } from "@/services/apiRoles";
import UsersTable from "@/components/UsersTable";
import { useAuth } from "@/providers/AuthProvider";

const PAGE_SIZE = 10;

function PaginationControls({
  currentPage,
  totalPages,
  total,
  endIndex,
  itemLabel,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  endIndex: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <i className="material-symbols-outlined !text-lg text-orange-500">
          info
        </i>
        <span>
          عرض{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {endIndex}
          </span>{" "}
          من{" "}
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {total}
          </span>{" "}
          {itemLabel}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <i className="material-symbols-outlined !text-base">chevron_right</i>
          السابق
        </button>

        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNumber = i + 1;
            const isCurrentPage = currentPage === pageNumber;
            const isNearCurrentPage =
              Math.abs(pageNumber - currentPage) <= 2;
            const isFirstPage = pageNumber === 1;
            const isLastPage = pageNumber === totalPages;

            if (
              isCurrentPage ||
              isNearCurrentPage ||
              isFirstPage ||
              isLastPage
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-all ${
                    isCurrentPage
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600"
                      : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }

            if (
              pageNumber === currentPage - 3 ||
              pageNumber === currentPage + 3
            ) {
              return (
                <span
                  key={pageNumber}
                  className="px-2 text-gray-400 dark:text-gray-500"
                >
                  ...
                </span>
              );
            }

            return null;
          })}
        </div>

        <button
          onClick={() =>
            onPageChange(Math.min(currentPage + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          التالي
          <i className="material-symbols-outlined !text-base">chevron_left</i>
        </button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
  const [adminPage, setAdminPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [adminSearch, setAdminSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [debouncedAdminSearch, setDebouncedAdminSearch] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");

  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAdminSearch(adminSearch), 500);
    return () => clearTimeout(timer);
  }, [adminSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUserSearch(userSearch), 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    setAdminPage(1);
  }, [debouncedAdminSearch]);

  useEffect(() => {
    setUserPage(1);
  }, [debouncedUserSearch]);

  const {
    data: adminsData,
    isLoading: adminsLoading,
    error: adminsError,
  } = useQuery({
    queryKey: ["admins", adminPage, debouncedAdminSearch],
    queryFn: () =>
      getAllAdmins(adminPage, PAGE_SIZE, { search: debouncedAdminSearch }),
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users", userPage, debouncedUserSearch],
    queryFn: () =>
      getAllUsers(userPage, PAGE_SIZE, { search: debouncedUserSearch }),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const rolesMap = Object.fromEntries(roles.map((r) => [r.slug, r]));

  const admins = adminsData?.admins || [];
  const users = usersData?.users || [];
  const adminsTotal = adminsData?.total || 0;
  const usersTotal = usersData?.total || 0;
  const adminsTotalPages = adminsData?.totalPages || 0;
  const usersTotalPages = usersData?.totalPages || 0;

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["admins"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const toggleCustomerStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setCustomerStatus(userId, isActive),
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم");
      invalidateUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleAdminStatusMutation = useMutation({
    mutationFn: ({
      adminId,
      isActive,
    }: {
      adminId: string;
      isActive: boolean;
    }) => setAdminStatus(adminId, isActive),
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? "تم تفعيل المدير" : "تم تعطيل المدير");
      invalidateUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      invalidateUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteAdminMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      toast.success("تم حذف المدير بنجاح");
      invalidateUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateAdminRole(userId, role),
    onSuccess: () => {
      toast.success("تم تحديث الدور بنجاح");
      invalidateUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canManage =
    currentUser?.role === "super_admin" ||
    (Array.isArray(currentUser?.permissions) &&
      currentUser.permissions.includes("users:manage"));

  const activeSearch = activeTab === "admin" ? adminSearch : userSearch;
  const setActiveSearch =
    activeTab === "admin" ? setAdminSearch : setUserSearch;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إدارة المستخدمين
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض وإدارة المستخدمين والمدراء في النظام
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "admin"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              المدراء
              {!adminsLoading && (
                <span className="mr-2 bg-gray-200 dark:bg-gray-700 py-0.5 px-2 rounded-full text-xs">
                  {adminsTotal}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "user"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              المستخدمين
              {!usersLoading && (
                <span className="mr-2 bg-gray-200 dark:bg-gray-700 py-0.5 px-2 rounded-full text-xs">
                  {usersTotal}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {(adminsError && activeTab === "admin") ||
      (usersError && activeTab === "user") ? (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            حدث خطأ في تحميل البيانات
          </p>
        </div>
      ) : null}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي المدراء
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {adminsLoading ? "..." : adminsTotal}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي المستخدمين
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {usersLoading ? "..." : usersTotal}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                الإجمالي الكلي
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {adminsLoading || usersLoading
                  ? "..."
                  : adminsTotal + usersTotal}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
              placeholder={
                activeTab === "admin"
                  ? "ابحث بالاسم، البريد، الهاتف، أو الدور..."
                  : "ابحث بالاسم، البريد، أو الهاتف..."
              }
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 hover:border-orange-300 focus:border-orange-500 transition-all rounded-md outline-none dark:border-gray-600 dark:hover:border-orange-600 dark:focus:border-orange-500 dark:bg-gray-800 dark:text-white"
            />
            <i className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 !text-[18px]">
              search
            </i>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "admin" ? (
            <>
              <UsersTable
                users={admins}
                type="admin"
                isLoading={adminsLoading}
                rolesMap={rolesMap}
                currentUserId={currentUser?.id}
                canManage={canManage}
                onToggleStatus={(userId, isActive) =>
                  toggleAdminStatusMutation.mutateAsync({
                    adminId: userId,
                    isActive,
                  })
                }
                onDelete={(userId) => deleteAdminMutation.mutateAsync(userId)}
                onChangeRole={(userId, role) =>
                  changeRoleMutation.mutateAsync({ userId, role })
                }
              />
              <PaginationControls
                currentPage={adminPage}
                totalPages={adminsTotalPages}
                total={adminsTotal}
                endIndex={Math.min(adminPage * PAGE_SIZE, adminsTotal)}
                itemLabel="مدير"
                onPageChange={setAdminPage}
              />
            </>
          ) : (
            <>
              <UsersTable
                users={users}
                type="user"
                isLoading={usersLoading}
                currentUserId={currentUser?.id}
                canManage={canManage}
                onToggleStatus={(userId, isActive) =>
                  toggleCustomerStatusMutation.mutateAsync({ userId, isActive })
                }
                onDelete={(userId) => deleteCustomerMutation.mutateAsync(userId)}
              />
              <PaginationControls
                currentPage={userPage}
                totalPages={usersTotalPages}
                total={usersTotal}
                endIndex={Math.min(userPage * PAGE_SIZE, usersTotal)}
                itemLabel="مستخدم"
                onPageChange={setUserPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
