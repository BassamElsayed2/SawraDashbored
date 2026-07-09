"use client";

import React, { useEffect } from "react";
import DarkMode from "./DarkMode";
import Fullscreen from "./Fullscreen";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "./NotificationBell";
import PageTitle from "./PageTitle";

interface HeaderProps {
  toggleActive: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  useEffect(() => {
    const elementId = document.getElementById("header");
    const handleScroll = () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("header-scrolled");
      } else {
        elementId?.classList.remove("header-scrolled");
      }
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="header"
      className="header-area header-enhanced bg-white/90 dark:bg-[#0c1427]/90 backdrop-blur-md py-[13px] px-[20px] md:px-[25px] fixed top-0 z-[6] rounded-b-md transition-all border-b border-gray-100/80 dark:border-[#172036]/80"
    >
      <div className="md:flex md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            type="button"
            className="header-icon-btn hide-sidebar-toggle transition-all shrink-0"
            onClick={toggleActive}
            aria-label="فتح القائمة"
          >
            <i className="material-symbols-outlined !text-[20px]">menu</i>
          </button>

          <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-[#172036] shrink-0" />

          <PageTitle />
        </div>

        <div className="flex items-center justify-center md:justify-end mt-[13px] md:mt-0 gap-1">
          <NotificationBell />
          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-[#172036] mx-1" />
          <DarkMode />
          <Fullscreen />
          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-[#172036] mx-1" />
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;
