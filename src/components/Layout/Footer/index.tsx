"use client";

import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-area mt-auto border-t border-gray-100 bg-white py-[16px] px-[20px] md:px-[25px] dark:border-[#172036] dark:bg-[#0c1427]">
      <div className="flex flex-col items-center justify-between gap-2 text-sm text-gray-500 md:flex-row dark:text-gray-400">
        <p>© {currentYear} ENS — لوحة التحكم. جميع الحقوق محفوظة.</p>
        <p className="text-xs opacity-80">نظام إدارة المطاعم</p>
      </div>
    </footer>
  );
};

export default Footer;
