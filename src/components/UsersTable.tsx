"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/image-url";
import { Role } from "@/services/apiRoles";

interface BaseUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  joined_at: string | Date;
  is_active?: boolean;
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
  rolesMap?: Record<string, Role>;
  currentUserId?: string;
  canManage?: boolean;
  onToggleStatus?: (userId: string, isActive: boolean) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
  onChangeRole?: (userId: string, role: string) => Promise<void>;
}

const SYSTEM_ROLE_COLORS: Record<string, string> = {
  super_admin:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  manager: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  type,
  isLoading,
  rolesMap = {},
  currentUserId,
  canManage = false,
  onToggleStatus,
  onDelete,
  onChangeRole,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [roleEditing, setRoleEditing] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleLabel = (slug: string) => {
    return rolesMap[slug]?.name_ar || slug;
  };

  const getRoleColor = (slug: string) => {
    return (
      SYSTEM_ROLE_COLORS[slug] ||
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    );
  };

  const handleToggleStatus = async (user: BaseUser) => {
    if (!onToggleStatus) return;
    const userId = user.user_id;
    setActionLoading(userId);
    try {
      await onToggleStatus(userId, !user.is_active);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!onDelete) return;
    setActionLoading(userId);
    try {
      await onDelete(userId);
      setConfirmDelete(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string) => {
    if (!onChangeRole || !selectedRole) return;
    setActionLoading(userId);
    try {
      await onChangeRole(userId, selectedRole);
      setRoleEditing(null);
    } finally {
      setActionLoading(null);
    }
  };

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

  return (
    <>
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
                  عدد الطلبات
                </th>
              )}
              <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                الحالة
              </th>
              <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                تاريخ الانضمام
              </th>
              {canManage && (
                <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  إجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.user_id === currentUserId;
              const isActive = user.is_active !== false;

              return (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !isActive ? "opacity-60" : ""
                  }`}
                >
                  {type === "admin" && (
                    <td className="py-4 px-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {(user as AdminUser).image_url ? (
                          <Image
                            src={getImageUrl((user as AdminUser).image_url)}
                            alt={user.full_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Image
                            src="/placeholder.svg"
                            alt={user.full_name}
                            fill
                            className="object-cover"
                          />
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
                    <span
                      className="text-gray-700 dark:text-gray-300 text-left"
                      dir="ltr"
                    >
                      {user.email}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="text-gray-700 dark:text-gray-300 text-left"
                      dir="ltr"
                    >
                      {user.phone || "غير محدد"}
                    </span>
                  </td>
                  {type === "admin" && (
                    <td className="py-4 px-4">
                      {roleEditing === user.user_id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
                          >
                            {Object.values(rolesMap).map((role) => (
                              <option key={role.id} value={role.slug}>
                                {role.name_ar}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRoleChange(user.user_id)}
                            disabled={actionLoading === user.user_id}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            حفظ
                          </button>
                          <button
                            type="button"
                            onClick={() => setRoleEditing(null)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                            (user as AdminUser).role,
                          )}`}
                        >
                          {getRoleLabel((user as AdminUser).role)}
                        </span>
                      )}
                    </td>
                  )}
                  {type === "user" && (
                    <td className="py-4 px-4">
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {(user as RegularUser).orders_count || 0}
                      </span>
                    </td>
                  )}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {isActive ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {formatDate(user.joined_at)}
                  </td>
                  {canManage && (
                    <td className="py-4 px-4">
                      {!isSelf ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user.user_id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              isActive
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                            } disabled:opacity-50`}
                          >
                            {isActive ? "تعطيل" : "تفعيل"}
                          </button>
                          {type === "admin" && onChangeRole && (
                            <button
                              type="button"
                              onClick={() => {
                                setRoleEditing(user.user_id);
                                setSelectedRole((user as AdminUser).role);
                              }}
                              disabled={actionLoading === user.user_id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 disabled:opacity-50"
                            >
                              تغيير الدور
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(user.user_id)}
                            disabled={actionLoading === user.user_id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 disabled:opacity-50"
                          >
                            حذف
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">حسابك</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-[#172036] dark:bg-[#0c1427]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              تأكيد الحذف
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={actionLoading !== null}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading !== null}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "جاري الحذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersTable;
