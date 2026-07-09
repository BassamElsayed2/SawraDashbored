"use client";

import React, { useState } from "react";

const Fullscreen: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Error toggling full-screen mode
    }
  };

  return (
    <>
      <div className="relative mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
        <button
          type="button"
          className="header-icon-btn"
          onClick={handleToggleFullscreen}
          aria-label={isFullscreen ? "الخروج من وضع ملء الشاشة" : "ملء الشاشة"}
        >
          <i className="material-symbols-outlined !text-[20px]">
            {isFullscreen ? "fullscreen_exit" : "fullscreen"}
          </i>
        </button>
      </div>
    </>
  );
};

export default Fullscreen;
