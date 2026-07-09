export interface NavLinkItem {
  type: "link";
  label: string;
  href: string;
  icon: string;
  iconType?: "material" | "remix";
}

export interface NavGroupItem {
  type: "group";
  id: string;
  label: string;
  icon: string;
  children: Omit<NavLinkItem, "type">[];
}

export type NavItem = NavLinkItem | NavGroupItem;

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "رئيسي",
    items: [
      {
        type: "link",
        label: "لوحة التحكم",
        href: "/dashboard/",
        icon: "dashboard",
      },
      {
        type: "group",
        id: "products",
        label: "المنتجات",
        icon: "restaurant_menu",
        children: [
          {
            label: "قائمة المنتجات",
            href: "/dashboard/products/",
            icon: "ri-list-check-2",
            iconType: "remix",
          },
          {
            label: "إنشاء منتج",
            href: "/dashboard/products/create/",
            icon: "ri-add-circle-line",
            iconType: "remix",
          },
          {
            label: "تصنيفات",
            href: "/dashboard/products/categories/",
            icon: "ri-price-tag-3-line",
            iconType: "remix",
          },
        ],
      },
      {
        type: "group",
        id: "offers",
        label: "العروض",
        icon: "paid",
        children: [
          {
            label: "قائمة العروض",
            href: "/dashboard/ads/",
            icon: "ri-menu-search-line",
            iconType: "remix",
          },
          {
            label: "إنشاء عرض",
            href: "/dashboard/ads/create-combo-offer",
            icon: "ri-file-add-line",
            iconType: "remix",
          },
        ],
      },
      {
        type: "group",
        id: "branches",
        label: "الفروع",
        icon: "map",
        children: [
          {
            label: "قائمة الفروع",
            href: "/dashboard/branches/",
            icon: "ri-map-pin-line",
            iconType: "remix",
          },
          {
            label: "إنشاء فرع",
            href: "/dashboard/branches/create-branch",
            icon: "ri-map-pin-add-line",
            iconType: "remix",
          },
        ],
      },
      {
        type: "group",
        id: "feedback",
        label: "التقييمات",
        icon: "rate_review",
        children: [
          {
            label: "لوحة تحكم التقييمات",
            href: "/dashboard/feedback/",
            icon: "ri-feedback-line",
            iconType: "remix",
          },
        ],
      },
      {
        type: "group",
        id: "orders",
        label: "الطلبات",
        icon: "shopping_cart",
        children: [
          {
            label: "قائمة الطلبات",
            href: "/dashboard/orders/",
            icon: "ri-list-check",
            iconType: "remix",
          },
        ],
      },
      {
        type: "link",
        label: "رسوم التوصيل",
        href: "/dashboard/delivery-fees/",
        icon: "local_shipping",
      },
    ],
  },
  {
    title: "أخري",
    items: [
      {
        type: "link",
        label: "ملفي الشخصي",
        href: "/dashboard/my-profile/",
        icon: "account_circle",
      },
      {
        type: "link",
        label: "المستخدمين",
        href: "/dashboard/users/",
        icon: "group",
      },
      {
        type: "link",
        label: "الأدوار والصلاحيات",
        href: "/dashboard/roles/",
        icon: "admin_panel_settings",
      },
      {
        type: "group",
        id: "settings",
        label: "إعدادات",
        icon: "settings",
        children: [
          {
            label: "إعدادات الحساب",
            href: "/dashboard/my-profile/edit/",
            icon: "manage_accounts",
          },
          {
            label: "تغيير كلمة المرور",
            href: "/dashboard/my-profile/change-password/",
            icon: "lock",
          },
          {
            label: "أضف مستخدم",
            href: "/dashboard/add-user/",
            icon: "person_add",
          },
        ],
      },
    ],
  },
];

const ROUTE_GROUP_MAP: Record<string, string> = {
  "/dashboard/products": "products",
  "/dashboard/ads": "offers",
  "/dashboard/branches": "branches",
  "/dashboard/feedback": "feedback",
  "/dashboard/orders": "orders",
  "/dashboard/my-profile/edit": "settings",
  "/dashboard/my-profile/change-password": "settings",
  "/dashboard/add-user": "settings",
};

export function getActiveGroupId(pathname: string): string | null {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  for (const [prefix, groupId] of Object.entries(ROUTE_GROUP_MAP)) {
    if (normalized.startsWith(prefix)) {
      return groupId;
    }
  }

  return null;
}

const PAGE_META: Record<string, { title: string; section?: string }> = {
  "/dashboard/": { title: "لوحة التحكم", section: "رئيسي" },
  "/dashboard/products/": { title: "قائمة المنتجات", section: "المنتجات" },
  "/dashboard/products/create/": { title: "إنشاء منتج", section: "المنتجات" },
  "/dashboard/products/categories/": { title: "تصنيفات", section: "المنتجات" },
  "/dashboard/ads/": { title: "قائمة العروض", section: "العروض" },
  "/dashboard/ads/create-combo-offer/": {
    title: "إنشاء عرض",
    section: "العروض",
  },
  "/dashboard/branches/": { title: "قائمة الفروع", section: "الفروع" },
  "/dashboard/branches/create-branch/": { title: "إنشاء فرع", section: "الفروع" },
  "/dashboard/feedback/": { title: "التقييمات", section: "التقييمات" },
  "/dashboard/orders/": { title: "قائمة الطلبات", section: "الطلبات" },
  "/dashboard/delivery-fees/": { title: "رسوم التوصيل", section: "رئيسي" },
  "/dashboard/my-profile/": { title: "ملفي الشخصي", section: "أخري" },
  "/dashboard/my-profile/edit/": { title: "إعدادات الحساب", section: "إعدادات" },
  "/dashboard/my-profile/change-password/": {
    title: "تغيير كلمة المرور",
    section: "إعدادات",
  },
  "/dashboard/users/": { title: "المستخدمين", section: "أخري" },
  "/dashboard/roles/": { title: "الأدوار والصلاحيات", section: "أخري" },
  "/dashboard/add-user/": { title: "أضف مستخدم", section: "إعدادات" },
};

export function getPageMeta(pathname: string): { title: string; section?: string } {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;

  if (PAGE_META[normalized]) {
    return PAGE_META[normalized];
  }

  if (normalized.startsWith("/dashboard/orders/")) {
    return { title: "تفاصيل الطلب", section: "الطلبات" };
  }

  if (normalized.startsWith("/dashboard/products/")) {
    return { title: "المنتجات", section: "المنتجات" };
  }

  return { title: "لوحة التحكم", section: "رئيسي" };
}

export function isNavLinkActive(pathname: string, href: string): boolean {
  const normalizedPath = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const normalizedHref = href.endsWith("/") ? href : `${href}/`;

  if (normalizedHref === "/dashboard/") {
    return normalizedPath === "/dashboard/";
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(normalizedHref);
}
