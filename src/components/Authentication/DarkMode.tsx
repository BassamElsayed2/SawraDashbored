"use client";

import React, { useState, useEffect } from "react";

const DarkMode: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(storedPreference === "dark" || (!storedPreference && prefersDark));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      htmlElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode, mounted]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      aria-label={isDarkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      className="fixed top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200/80 bg-white/80 text-primary-500 shadow-md backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:shadow-lg dark:border-[#172036] dark:bg-[#0c1427]/80 dark:hover:bg-[#0c1427] ltr:right-5 rtl:left-5"
      onClick={() => setIsDarkMode((prev) => !prev)}
    >
      <i className="material-symbols-outlined text-[22px]">
        {isDarkMode ? "light_mode" : "dark_mode"}
      </i>
    </button>
  );
};

export default DarkMode;
