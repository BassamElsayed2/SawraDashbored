"use client";

import React, { useMemo } from "react";
import { PermissionDefinition, Role } from "@/services/apiRoles";

export interface RoleFormData {
  name_ar: string;
  permissions: string[];
}

interface RoleFormModalProps {
  open: boolean;
  editingRole: Role | null;
  formData: RoleFormData;
  groupedPermissions: Record<string, PermissionDefinition[]>;
  groups: Record<string, string>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: RoleFormData) => void;
}

export default function RoleFormModal({
  open,
  editingRole,
  formData,
  groupedPermissions,
  groups,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}: RoleFormModalProps) {
  const totalAvailable = useMemo(
    () =>
      Object.values(groupedPermissions).reduce((n, g) => n + g.length, 0),
    [groupedPermissions]
  );

  const coverage =
    totalAvailable > 0
      ? Math.round((formData.permissions.length / totalAvailable) * 100)
      : 0;

  const togglePermission = (key: string) => {
    onChange({
      ...formData,
      permissions: formData.permissions.includes(key)
        ? formData.permissions.filter((p) => p !== key)
        : [...formData.permissions, key],
    });
  };

  const toggleGroup = (perms: PermissionDefinition[], selectAll: boolean) => {
    const keys = perms.map((p) => p.key);
    onChange({
      ...formData,
      permissions: selectAll
        ? [...new Set([...formData.permissions, ...keys])]
        : formData.permissions.filter((p) => !keys.includes(p)),
    });
  };

  const selectAllPermissions = () => {
    const all = Object.values(groupedPermissions).flat().map((p) => p.key);
    onChange({ ...formData, permissions: all });
  };

  const clearPermissions = () => {
    onChange({ ...formData, permissions: [] });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-gray-100 bg-white shadow-2xl dark:border-[#172036] dark:bg-[#0c1427] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-[#172036]">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingRole ? "تعديل الدور" : "إنشاء دور جديد"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  اسم الدور والصلاحيات المرتبطة به
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#15203c]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    اسم الدور *
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) =>
                      onChange({ ...formData, name_ar: e.target.value })
                    }
                    placeholder="مثال: مدير المحتوى"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-[#172036] dark:bg-[#15203c] dark:text-white"
                  />
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-[#172036] dark:bg-[#15203c]/50">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        الصلاحيات
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.permissions.length} من {totalAvailable} صلاحية
                        محددة ({coverage}%)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllPermissions}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-[#0c1427] dark:text-gray-300"
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        onClick={clearPermissions}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-[#0c1427] dark:text-gray-300"
                      >
                        إلغاء الكل
                      </button>
                    </div>
                  </div>
                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-orange-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${coverage}%` }}
                    />
                  </div>

                  <div className="space-y-3">
                    {Object.entries(groupedPermissions).map(([group, perms]) => {
                      const selectedInGroup = perms.filter((p) =>
                        formData.permissions.includes(p.key)
                      ).length;
                      const allSelected = selectedInGroup === perms.length;

                      return (
                        <div
                          key={group}
                          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[#172036] dark:bg-[#0c1427]"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg text-orange-500">
                                {group === "users"
                                  ? "group"
                                  : group === "roles"
                                    ? "admin_panel_settings"
                                    : group === "orders"
                                      ? "shopping_cart"
                                      : "tune"}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {groups[group] || group}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {selectedInGroup}/{perms.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                toggleGroup(perms, !allSelected)
                              }
                              className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
                            >
                              {allSelected ? "إلغاء المجموعة" : "تحديد المجموعة"}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {perms.map((perm) => {
                              const checked = formData.permissions.includes(
                                perm.key
                              );
                              return (
                                <label
                                  key={perm.key}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                                    checked
                                      ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
                                      : "border-transparent hover:bg-gray-50 dark:hover:bg-[#15203c]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePermission(perm.key)}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {perm.label_ar}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-[#172036]">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#15203c]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <span className="material-symbols-outlined animate-spin text-base">
                      progress_activity
                    </span>
                  )}
                  {editingRole ? "حفظ التعديلات" : "إنشاء الدور"}
                </button>
              </div>
            </form>
      </div>
    </div>
  );
}
