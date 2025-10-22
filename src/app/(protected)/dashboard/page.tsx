"use client";

import { useEffect, useState, useCallback } from "react";
import Welcome from "@/components/Dashboard/Restaurant/Welcome";
import DashboardStats from "@/components/Dashboard/DashboardStats";
import TopProducts from "@/components/Dashboard/TopProducts";
import QuickActions from "@/components/Dashboard/QuickActions";
import OrdersChart from "@/components/Dashboard/OrdersChart";
import RevenueCard from "@/components/Dashboard/RevenueCard";
import { getAllUsers } from "@/services/apiUsers";
import { getProducts } from "@/services/apiProducts";
import ordersApi, { Order } from "@/services/apiOrders";

interface TopProduct {
  id: string;
  title: string;
  image_url: string;
  orders_count: number;
  total_revenue: number;
}

export default function DashboardPage() {
  // حالات تحميل منفصلة لكل section
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
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
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [ordersChartData, setOrdersChartData] = useState({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  });

  const calculateTopProducts = useCallback(
    async (orders: Order[]): Promise<TopProduct[]> => {
      const productMap = new Map<
        string,
        {
          title: string;
          image_url: string;
          orders_count: number;
          total_revenue: number;
          total_quantity: number;
        }
      >();

      // جمع بيانات المبيعات
      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const productId = item.product_id;
            const quantity = item.quantity || 1;

            // محاولة الحصول على السعر من عدة مصادر
            let itemPrice = 0;
            if (item.price && item.price > 0) {
              itemPrice = item.price;
            } else if (item.subtotal && item.subtotal > 0) {
              itemPrice = item.subtotal / quantity; // السعر للوحدة
            } else if (order.total && order.items && order.items.length === 1) {
              itemPrice = order.total; // إذا كان منتج واحد فقط
            }

            const revenue = itemPrice * quantity;

            const existing = productMap.get(productId);

            if (existing) {
              existing.orders_count += 1;
              existing.total_quantity += quantity;
              existing.total_revenue += revenue;
            } else {
              productMap.set(productId, {
                title: item.product_name_ar || "جاري التحميل...",
                image_url: "/placeholder.svg",
                orders_count: 1,
                total_quantity: quantity,
                total_revenue: revenue,
              });
            }
          });
        }
      });

      // ✅ جلب تفاصيل المنتجات بالتوازي (أسرع بكثير!)
      const productIds = Array.from(productMap.keys());

      // استخدام Promise.all لجلب كل المنتجات في نفس الوقت (5 ثواني للكل بدلاً من 25!)
      const productFetches = productIds.map((productId) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
          credentials: "include",
          signal: AbortSignal.timeout(5000),
        })
          .then((response) => {
            if (response.ok) return response.json();
            return null;
          })
          .catch(() => null)
      );

      const productsResults = await Promise.all(productFetches);

      // تحديث بيانات المنتجات
      productsResults.forEach((result, index) => {
        const productId = productIds[index];
        const data = productMap.get(productId);

        if (data) {
          if (result?.data?.product) {
            const product = result.data.product;
            data.title = product.title_ar || product.title_en || data.title;
            data.image_url = product.image_url || "/placeholder.svg";
          } else if (data.title === "جاري التحميل...") {
            // إذا فشل الـ fetch، نستخدم اسم من الـ order أو ID
            data.title = `منتج #${productId.substring(0, 8)}`;
          }
        }
      });

      return Array.from(productMap.entries())
        .map(([id, data]) => ({
          id,
          title: data.title,
          image_url: data.image_url,
          orders_count: data.total_quantity,
          total_revenue: data.total_revenue,
        }))
        .sort((a, b) => b.orders_count - a.orders_count)
        .slice(0, 5);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      if (!isMounted) return;

      setHasError(false);

      try {
        // جلب البيانات بالتوازي وتحديث كل section فور الانتهاء ⚡

        // 1. جلب المستخدمين والمنتجات (للإحصائيات الأساسية)
        Promise.allSettled([getAllUsers(), getProducts(1, 1)]).then(
          ([usersResult, productsResult]) => {
            if (!isMounted) return;

            const users =
              usersResult.status === "fulfilled" ? usersResult.value : [];
            const productsData =
              productsResult.status === "fulfilled"
                ? productsResult.value
                : { total: 0 };

            setStats((prev) => ({
              ...prev,
              totalUsers: users?.length || 0,
              totalProducts: productsData?.total || 0,
            }));
          }
        );

        // 2. جلب إحصائيات الطلبات
        ordersApi
          .getOrderStats()
          .then((result) => {
            if (!isMounted) return;
            const orderStats = result.data;

            // تحديث الإحصائيات
            setStats((prev) => ({
              ...prev,
              totalOrders: orderStats?.total_orders || 0,
              totalRevenue: orderStats?.total_revenue || 0,
              activeOrders:
                (orderStats?.confirmed_orders || 0) +
                (orderStats?.preparing_orders || 0) +
                (orderStats?.delivering_orders || 0),
              completedOrders: orderStats?.delivered_orders || 0,
              cancelledOrders: orderStats?.cancelled_orders || 0,
              averageOrderValue: orderStats?.average_order_value || 0,
            }));

            setLoadingStats(false);
            setLoadingRevenue(false);

            // تحديث بيانات الرسم البياني
            setOrdersChartData({
              pending: orderStats?.pending_orders || 0,
              confirmed: orderStats?.confirmed_orders || 0,
              preparing: orderStats?.preparing_orders || 0,
              ready: orderStats?.ready_orders || 0,
              delivering: orderStats?.delivering_orders || 0,
              delivered: orderStats?.delivered_orders || 0,
              cancelled: orderStats?.cancelled_orders || 0,
            });

            setLoadingChart(false);
          })
          .catch(() => {
            setLoadingStats(false);
            setLoadingChart(false);
            setLoadingRevenue(false);
          });

        // 3. جلب الطلبات وحساب المنتجات الأكثر مبيعاً
        ordersApi
          .getAllOrders({ limit: 50 })
          .then(async (result) => {
            if (!isMounted) return;
            const ordersData = result.data || [];

            // حساب المنتجات الأكثر مبيعاً
            const productStats = await calculateTopProducts(ordersData);

            if (!isMounted) return;
            setTopProducts(productStats);
            setLoadingTopProducts(false);
          })
          .catch(() => {
            setLoadingTopProducts(false);
          });

        // Clear timeout on success
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
          setLoadingStats(false);
          setLoadingTopProducts(false);
          setLoadingChart(false);
          setLoadingRevenue(false);
        }
      }
    };

    // استخدام timeout للتأكد من عدم البقاء في حالة التحميل للأبد
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoadingStats(false);
        setLoadingTopProducts(false);
        setLoadingChart(false);
        setLoadingRevenue(false);
        setHasError(true);
      }
    }, 30000); // 30 ثانية

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [calculateTopProducts]); // Run only once on mount

  if (hasError && loadingStats && loadingTopProducts && loadingChart) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-5xl">
              error
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            فشل تحميل البيانات
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى التحقق من:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 text-right mb-6 space-y-2">
            <li>• تشغيل Backend Server</li>
            <li>• الاتصال بقاعدة البيانات</li>
            <li>• Console للحصول على تفاصيل الخطأ</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Welcome />

      {/* الإحصائيات الرئيسية */}
      <DashboardStats stats={stats} isLoading={loadingStats} />

      {/* الصف الأول: المنتجات الأكثر طلباً والإجراءات السريعة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={topProducts} isLoading={loadingTopProducts} />
        <QuickActions />
      </div>

      {/* الصف الثاني: الرسم البياني للطلبات وبطاقة الإيرادات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrdersChart data={ordersChartData} isLoading={loadingChart} />
        </div>
        <div>
          <RevenueCard
            totalRevenue={stats.totalRevenue}
            averageOrderValue={stats.averageOrderValue}
            totalOrders={stats.totalOrders}
            completedOrders={stats.completedOrders}
            isLoading={loadingRevenue}
          />
        </div>
      </div>
    </div>
  );
}
