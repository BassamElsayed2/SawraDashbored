"use client";

import RecentProperty from "@/components/RecentProperty";
import Welcome from "@/components/Dashboard/Restaurant/Welcome";
import RecentNews from "@/components/RecentNews";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/apiProducts";
import { getOffers } from "@/services/apiComboOffers";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";

export default function DashboardPage() {
  // جلب جميع البيانات الأساسية
  const { data: profile, isLoading: profileLoading } = useAdminProfile();
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  const { data: comboOffers, isLoading: offersLoading } = useQuery({
    queryKey: ["comboOffers"],
    queryFn: () => getOffers(),
  });

  // التحقق من حالة التحميل لجميع البيانات
  const isLoading = profileLoading || productsLoading || offersLoading;

  // عرض شاشة التحميل حتى يتم تحميل جميع البيانات
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            جارٍ تحميل البيانات...
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            يرجى الانتظار قليلاً
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Welcome />
      <div className="2xl:grid 2xl:grid-cols-2 gap-[25px]">
        <div>
          <RecentProperty />
        </div>
        <RecentNews />
      </div>
    </>
  );
}
