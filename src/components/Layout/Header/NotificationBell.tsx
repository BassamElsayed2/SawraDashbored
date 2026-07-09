"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ordersApi } from "@/services/apiOrders";

const NotificationBell: React.FC = () => {
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConfirmedOrders = async () => {
    try {
      const { data, error } = await ordersApi.getOrderStats();
      if (!error && data) {
        setConfirmedCount(data.confirmed_orders || 0);
      }
    } catch {
      // Error fetching confirmed orders
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchConfirmedOrders();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConfirmedOrders();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative ltr:mr-[13px] ltr:md:mr-[18px] ltr:lg:mr-[23px] rtl:ml-[13px] rtl:md:ml-[18px] rtl:lg:ml-[23px]">
      <Link
        href="/dashboard/orders"
        className="header-icon-btn relative"
        title="الطلبات المدفوعة"
      >
        <i className="material-symbols-outlined !text-[22px]">notifications</i>

        {confirmedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {confirmedCount > 99 ? "99+" : confirmedCount}
          </span>
        )}

        {isLoading && confirmedCount === 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        )}
      </Link>
    </div>
  );
};

export default NotificationBell;
