"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getAllRoles,
  getPermissionsCatalog,
  createRole,
  updateRole,
  deleteRole,
  Role,
} from "@/services/apiRoles";
import { useAuth } from "@/providers/AuthProvider";
import RoleFormModal, {
  RoleFormData,
} from "@/components/Roles/RoleFormModal";
import RoleCard from "@/components/Roles/RoleCard";
import { countRolesByType } from "@/components/Roles/role-utils";

type FilterType = "all" | "system" | "custom";

const EMPTY_FORM: RoleFormData = {
  name_ar: "",
  permissions: [],
};

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const canManageRoles =
    currentUser?.role === "super_admin" ||
    currentUser?.permissions?.includes("roles:manage");

  const { data: roles = [], isLoading, isError } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
  });

  const { data: catalog } = useQuery({
    queryKey: ["permissions-catalog"],
    queryFn: getPermissionsCatalog,
  });

  const permissions = catalog?.permissions || [];
  const groups = catalog?.groups || {};

  const groupedPermissions = useMemo(
    () =>
      permissions.reduce<Record<string, typeof permissions>>((acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = [];
        acc[perm.group].push(perm);
        return acc;
      }, {}),
    [permissions]
  );

  const stats = useMemo(() => countRolesByType(roles), [roles]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "system" && role.is_system) ||
        (filter === "custom" && !role.is_system);

      if (!matchesFilter) return false;
      if (!q) return true;

      return role.name_ar.toLowerCase().includes(q);
    });
  }, [roles, search, filter]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingRole(null);
    setFormOpen(false);
  };

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingRole(null);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name_ar: role.name_ar,
      permissions: [...role.permissions],
    });
    setFormOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("تم إنشاء الدور بنجاح");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleFormData }) =>
      updateRole(id, {
        name_ar: data.name_ar,
        permissions: data.permissions,
      }),
    onSuccess: () => {
      toast.success("تم تحديث الدور بنجاح");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("تم حذف الدور بنجاح");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar.trim()) {
      toast.error("اسم الدور مطلوب");
      return;
    }

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createMutation.mutate({
        name_ar: formData.name_ar,
        permissions: formData.permissions,
      });
    }
  };

  const statCards = [
    {
      label: "إجمالي الأدوار",
      value: stats.total,
      icon: "groups",
      color: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    },
    {
      label: "أدوار النظام",
      value: stats.system,
      icon: "shield",
      color: "from-purple-500 to-violet-600",
      bg: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
    },
    {
      label: "أدوار مخصصة",
      value: stats.custom,
      icon: "tune",
      color: "from-orange-500 to-amber-600",
      bg: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
    },
    {
      label: "صلاحيات مُعيَّنة",
      value: stats.totalPermissions,
      icon: "verified_user",
      color: "from-emerald-500 to-teal-600",
      bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
    },
  ];

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "system", label: "نظام" },
    { key: "custom", label: "مخصص" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            الأدوار والصلاحيات
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            تحكم في صلاحيات فريق العمل وحدد ما يمكن لكل دور الوصول إليه
          </p>
        </div>
        {canManageRoles && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            دور جديد
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-gray-100 bg-gradient-to-br p-4 dark:border-[#172036] ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "—" : card.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}
              >
                <span className="material-symbols-outlined text-xl">
                  {card.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#172036] dark:bg-[#0c1427] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن دور..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-[#172036] dark:bg-[#15203c] dark:text-white"
          />
        </div>
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-[#15203c]">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === tab.key
                  ? "bg-white text-orange-600 shadow-sm dark:bg-[#0c1427] dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#15203c]"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <span className="material-symbols-outlined mb-2 text-4xl text-red-500">
            error
          </span>
          <p className="font-medium text-red-800 dark:text-red-200">
            فشل تحميل الأدوار
          </p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-[#172036] dark:bg-[#0c1427]">
          <span className="material-symbols-outlined mb-3 text-5xl text-gray-300 dark:text-gray-600">
            admin_panel_settings
          </span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {search || filter !== "all"
              ? "لا توجد نتائج"
              : "لا توجد أدوار بعد"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search || filter !== "all"
              ? "جرّب تغيير البحث أو الفلتر"
              : "أنشئ أول دور مخصص لفريقك"}
          </p>
          {canManageRoles && !search && filter === "all" && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              إنشاء دور
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              permissions={permissions}
              groups={groups}
              canManage={!!canManageRoles}
              actorRole={currentUser?.role}
              onEdit={openEdit}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      <RoleFormModal
        open={formOpen && !!canManageRoles}
        editingRole={editingRole}
        formData={formData}
        groupedPermissions={groupedPermissions}
        groups={groups}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={resetForm}
        onSubmit={handleSubmit}
        onChange={setFormData}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-[#172036] dark:bg-[#0c1427]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  حذف الدور
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {deleteConfirm.name_ar}
                </p>
              </div>
            </div>
            <p className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
              لا يمكن حذف دور مُعيَّن لمستخدمين. تأكد أن لا أحد يستخدم هذا الدور
              قبل الحذف.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#15203c]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending && (
                  <span className="material-symbols-outlined animate-spin text-base">
                    progress_activity
                  </span>
                )}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
