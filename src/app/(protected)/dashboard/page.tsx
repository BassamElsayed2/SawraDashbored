"use client";

import { useEffect, useState } from "react";
import Welcome from "@/components/Dashboard/Restaurant/Welcome";
import DashboardStats from "@/components/Dashboard/DashboardStats";
import TopProducts from "@/components/Dashboard/TopProducts";
import QuickActions from "@/components/Dashboard/QuickActions";
import OrdersChart from "@/components/Dashboard/OrdersChart";
import RevenueCard from "@/components/Dashboard/RevenueCard";
import RecentOrders from "@/components/Dashboard/RecentOrders";
import { getDashboardStats } from "@/services/apiDashboard";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
  });
  const [topProducts, setTopProducts] = useState<
    {
      id: string;
      title: string;
      image_url: string;
      orders_count: number;
      total_revenue: number;
    }[]
  >([]);
  const [ordersChartData, setOrdersChartData] = useState({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    let isMounted = true;
    let finished = false;

    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        if (!isMounted) return;

        const orderStats = data.order_stats;

        setStats({
          totalUsers: data.total_users,
          totalProducts: data.total_products,
          totalOrders: orderStats?.total_orders || 0,
          totalRevenue: Number(orderStats?.total_revenue) || 0,
          activeOrders:
            (orderStats?.confirmed_orders || 0) +
            (orderStats?.preparing_orders || 0) +
            (orderStats?.delivering_orders || 0),
          completedOrders: orderStats?.delivered_orders || 0,
          cancelledOrders: orderStats?.cancelled_orders || 0,
          averageOrderValue: Number(orderStats?.average_order_value) || 0,
        });

        setOrdersChartData({
          pending: orderStats?.pending_orders || 0,
          confirmed: orderStats?.confirmed_orders || 0,
          preparing: orderStats?.preparing_orders || 0,
          ready: orderStats?.ready_orders || 0,
          delivering: orderStats?.delivering_orders || 0,
          delivered: orderStats?.delivered_orders || 0,
          cancelled: orderStats?.cancelled_orders || 0,
        });

        setTopProducts(data.top_products || []);
        setHasError(false);
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        finished = true;
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (isMounted && !finished) {
        setLoading(false);
        setHasError(true);
      }
    }, 30000);

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (
    hasError &&
    !loading &&
    stats.totalOrders === 0 &&
    stats.totalUsers === 0
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pb-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <span className="material-symbols-outlined text-5xl text-red-500">
              error
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
            فشل تحميل البيانات
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى التحقق من:
          </p>
          <ul className="mb-6 space-y-2 text-right text-sm text-gray-600 dark:text-gray-400">
            <li>• تشغيل Backend Server</li>
            <li>• الاتصال بقاعدة البيانات</li>
            <li>• Console للحصول على تفاصيل الخطأ</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition hover:bg-primary-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <Welcome
        totalProducts={stats.totalProducts}
        totalOrders={stats.totalOrders}
        activeOrders={stats.activeOrders}
        totalRevenue={stats.totalRevenue}
        isLoading={loading}
      />

      <DashboardStats stats={stats} isLoading={loading} />

      <RecentOrders />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProducts products={topProducts} isLoading={loading} />
        <RevenueCard
          totalRevenue={stats.totalRevenue}
          averageOrderValue={stats.averageOrderValue}
          totalOrders={stats.totalOrders}
          completedOrders={stats.completedOrders}
          isLoading={loading}
        />
      </div>

      <OrdersChart data={ordersChartData} isLoading={loading} />
    </div>
  );
}
