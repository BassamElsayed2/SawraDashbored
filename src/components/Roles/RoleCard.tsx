"use client";

import React, { useState } from "react";
import { PermissionDefinition, Role } from "@/services/apiRoles";
import { getRoleStyle, canDeleteRole } from "./role-utils";

interface RoleCardProps {
  role: Role;
  permissions: PermissionDefinition[];
  groups: Record<string, string>;
  canManage: boolean;
  actorRole?: string;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export default function RoleCard({
  role,
  permissions,
  groups,
  canManage,
  actorRole,
  onEdit,
  onDelete,
}: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = getRoleStyle(role.slug);
  const deleteCheck = canDeleteRole(role, actorRole);

  const permLabels = role.permissions.map(
    (key) => permissions.find((p) => p.key === key)?.label_ar || key
  );

  const grouped = role.permissions.reduce<Record<string, string[]>>(
    (acc, key) => {
      const def = permissions.find((p) => p.key === key);
      const group = def?.group || "other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(def?.label_ar || key);
      return acc;
    },
    {}
  );

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-[#172036] dark:bg-[#0c1427]"
    >
      <div className={`h-1.5 bg-gradient-to-l ${style.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-lg`}
            >
              <span className="material-symbols-outlined text-2xl">
                {style.icon}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                  {role.name_ar}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    role.is_system
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {role.is_system ? "نظام" : "مخصص"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-[#15203c]/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-lg">
                verified_user
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {role.permissions.length} صلاحية
              </span>
            </div>
            {(role.admins_count || 0) > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {role.admins_count} مستخدم
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            {expanded ? "إخفاء" : "عرض التفاصيل"}
            <span
              className={`material-symbols-outlined text-base transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>
        </div>

        {!expanded && permLabels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {permLabels.slice(0, 5).map((label) => (
              <span
                key={label}
                className={`rounded-lg px-2 py-1 text-xs font-medium ${style.badge}`}
              >
                {label}
              </span>
            ))}
            {permLabels.length > 5 && (
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
                +{permLabels.length - 5}
              </span>
            )}
          </div>
        )}

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-[#172036]">
            {Object.entries(grouped).map(([group, labels]) => (
              <div key={group}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {groups[group] || group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/25 dark:text-blue-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {role.permissions.length === 0 && (
              <p className="text-sm text-gray-500">لا توجد صلاحيات محددة</p>
            )}
          </div>
        )}

        {canManage && (
          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4 dark:border-[#172036]">
            <button
              type="button"
              onClick={() => onEdit(role)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/25 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              تعديل
            </button>
            <button
              type="button"
              onClick={() => deleteCheck.allowed && onDelete(role)}
              disabled={!deleteCheck.allowed}
              title={deleteCheck.reason}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-900/25 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              حذف
            </button>
          </div>
        )}
        {canManage && !deleteCheck.allowed && deleteCheck.reason && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {deleteCheck.reason}
          </p>
        )}
      </div>
    </div>
  );
}
