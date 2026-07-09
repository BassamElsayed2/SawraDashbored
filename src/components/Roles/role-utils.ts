import { Role } from "@/services/apiRoles";

export const ROLE_STYLES: Record<
  string,
  { gradient: string; icon: string; badge: string }
> = {
  super_admin: {
    gradient: "from-purple-500 to-violet-600",
    icon: "shield_person",
    badge:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  },
  admin: {
    gradient: "from-blue-500 to-indigo-600",
    icon: "admin_panel_settings",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  },
  manager: {
    gradient: "from-emerald-500 to-teal-600",
    icon: "supervisor_account",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
};

export const DEFAULT_ROLE_STYLE = {
  gradient: "from-orange-500 to-amber-600",
  icon: "badge",
  badge:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
};

export function getRoleStyle(slug: string) {
  return ROLE_STYLES[slug] || DEFAULT_ROLE_STYLE;
}

export function slugifyRoleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 40);
}

export function canDeleteRole(
  role: { slug: string; admins_count?: number },
  actorRole?: string
): { allowed: boolean; reason?: string } {
  if (role.slug === "super_admin") {
    return { allowed: false, reason: "لا يمكن حذف دور المدير العام" };
  }

  if ((role.admins_count || 0) > 0) {
    return {
      allowed: false,
      reason: `الدور مُعيَّن لـ ${role.admins_count} مستخدم. غيّر أدوارهم أولاً`,
    };
  }

  if (
    ["admin", "manager"].includes(role.slug) &&
    actorRole !== "super_admin"
  ) {
    return { allowed: false, reason: "حذف أدوار النظام للمدير العام فقط" };
  }

  return { allowed: true };
}

export function countRolesByType(roles: Role[]) {
  const system = roles.filter((r) => r.is_system).length;
  const custom = roles.length - system;
  const totalPermissions = roles.reduce((sum, r) => sum + r.permissions.length, 0);
  return { total: roles.length, system, custom, totalPermissions };
}
