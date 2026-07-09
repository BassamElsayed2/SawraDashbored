"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";
import { getImageUrl } from "@/lib/image-url";
import {
  NAV_SECTIONS,
  getActiveGroupId,
  isNavLinkActive,
  type NavGroupItem,
  type NavLinkItem,
} from "@/components/Layout/navigation";

interface SidebarMenuProps {
  toggleActive: () => void;
}

function NavIcon({
  icon,
  iconType = "material",
}: {
  icon: string;
  iconType?: "material" | "remix";
}) {
  if (iconType === "remix") {
    return (
      <i
        className={`${icon} transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px`}
      />
    );
  }

  return (
    <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
      {icon}
    </i>
  );
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { data: profile } = useAdminProfile();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [openGroupId, setOpenGroupId] = React.useState<string | null>(
    () => getActiveGroupId(pathname)
  );

  React.useEffect(() => {
    const activeGroup = getActiveGroupId(pathname);
    if (activeGroup) {
      setOpenGroupId(activeGroup);
    }
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
      // Logout error
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const renderLink = (item: NavLinkItem, isSubItem = false) => {
    const active = isNavLinkActive(pathname, item.href);
    const baseClass = isSubItem
      ? "sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c]"
      : "accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c]";

    return (
      <Link
        href={item.href}
        onClick={toggleActive}
        className={`${baseClass} ${active ? "active" : ""}`}
      >
        <NavIcon icon={item.icon} iconType={item.iconType} />
        <span className="title leading-none">{item.label}</span>
      </Link>
    );
  };

  const renderGroup = (item: NavGroupItem) => {
    const isOpen = openGroupId === item.id;
    const hasActiveChild = item.children.some((child) =>
      isNavLinkActive(pathname, child.href)
    );

    return (
      <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
        <button
          className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
            isOpen ? "open" : ""
          } ${hasActiveChild ? "active" : ""}`}
          type="button"
          onClick={() => toggleGroup(item.id)}
        >
          <NavIcon icon={item.icon} />
          <span className="title leading-none">{item.label}</span>
        </button>

        <div
          className={`accordion-collapse pt-[4px] ${isOpen ? "open" : "hidden"}`}
        >
          <ul className="sidebar-sub-menu">
            {item.children.map((child) => (
              <li key={child.href} className="sidemenu-item mb-[4px] last:mb-0">
                <Link
                  href={child.href}
                  onClick={toggleActive}
                  className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
                    isNavLinkActive(pathname, child.href) ? "active" : ""
                  }`}
                >
                  <NavIcon icon={child.icon} iconType={child.iconType} />
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar-area sidebar-enhanced bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
      <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
        <Link
          href="/dashboard/"
          className="transition-none relative flex items-center outline-none"
        >
          <Image
            src="/images/logo-icon.png"
            alt="logo-icon"
            width={150}
            height={150}
            className="w-[150px]"
            style={{ height: "auto" }}
          />
        </Link>

        <button
          type="button"
          className="burger-menu inline-flex items-center justify-center w-8 h-8 rounded-md absolute z-[3] top-[22px] ltr:right-[20px] rtl:left-[20px] transition-all hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-[#15203c]"
          onClick={toggleActive}
          aria-label="إغلاق القائمة"
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </div>

      <div className="sidebar-scroll-area pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar flex flex-col">
        <div className="accordion flex-1">
          {NAV_SECTIONS.map((section, sectionIndex) => (
            <React.Fragment key={section.title}>
              <span
                className={`block relative font-medium uppercase text-gray-400 mb-[8px] text-xs tracking-wide ${
                  sectionIndex > 0 ? "mt-[22px]" : ""
                }`}
              >
                {section.title}
              </span>

              {section.items.map((item) =>
                item.type === "link" ? (
                  <div
                    key={item.href}
                    className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap"
                  >
                    {renderLink(item)}
                  </div>
                ) : (
                  <React.Fragment key={item.id}>{renderGroup(item)}</React.Fragment>
                )
              )}
            </React.Fragment>
          ))}

          <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-red-50 hover:text-red-600 text-left dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                logout
              </i>
              <span className="title leading-none">
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </span>
            </button>
          </div>
        </div>

        {profile && (
          <div className="sidebar-user-card mt-4 pt-4 border-t border-gray-100 dark:border-[#172036]">
            <Link
              href="/dashboard/my-profile/"
              onClick={toggleActive}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#15203c] hover:bg-primary-50 dark:hover:bg-[#1a2847] transition-all group"
            >
              <Image
                src={getImageUrl(profile.image_url)}
                alt={profile.full_name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-primary-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black dark:text-white truncate group-hover:text-primary-500 transition-colors">
                  {profile.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile.job_title || profile.email}
                </p>
              </div>
              <i className="material-symbols-outlined text-gray-400 !text-[18px] shrink-0 group-hover:text-primary-500 transition-colors">
                chevron_left
              </i>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarMenu;
