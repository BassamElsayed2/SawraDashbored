"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { getPageMeta } from "@/components/Layout/navigation";

const PageTitle: React.FC = () => {
  const pathname = usePathname();
  const { title, section } = getPageMeta(pathname);

  return (
    <div className="hidden sm:block min-w-0">
      <h1 className="text-base md:text-lg font-semibold text-black dark:text-white truncate leading-tight">
        {title}
      </h1>
    </div>
  );
};

export default PageTitle;
