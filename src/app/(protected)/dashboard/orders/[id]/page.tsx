"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ordersApi, Order, OrderItem } from "@/services/apiOrders";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  type ExtendedOrder = Order & {
    items?: (OrderItem & {
      size_data?: { size_ar?: string; size_en?: string };
      title_ar?: string;
      title_en?: string;
      product_name_ar?: string;
      product_name_en?: string;
      total_price?: number;
      price_per_unit?: number;
    })[];
    addresses?: {
      title: string;
      street: string;
      building?: string;
      floor?: string;
      apartment?: string;
      area: string;
      city: string;
      notes?: string;
    };
    delivery_type?: "delivery" | "pickup" | "dine-in";
    address_name?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    area?: string;
    city?: string;
    address_notes?: string;
    latitude?: number;
    longitude?: number;
    payment_method?: "cash" | "card" | "online";
  };

  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await ordersApi.getOrderById(orderId);
      if (error) {
        toast.error("فشل تحميل تفاصيل الطلب");
        console.error(error);
      } else {
        setOrder(data);
        setNotes(data?.notes || "");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleStatusChange = async (newStatus: Order["status"]) => {
    setIsUpdating(true);
    try {
      const { error } = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (error) {
        toast.error("فشل تحديث حالة الطلب");
        console.error(error);
      } else {
        toast.success("تم تحديث حالة الطلب بنجاح");
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNotes = async () => {
    setIsUpdating(true);
    try {
      const { error } = await ordersApi.updateOrderNotes(orderId, notes);
      if (error) {
        toast.error("فشل تحديث الملاحظات");
        console.error(error);
      } else {
        toast.success("تم تحديث الملاحظات بنجاح");
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pending: {
        label: "قيد الانتظار",
        color: "bg-yellow-100 text-yellow-800",
      },
      confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-800" },
      preparing: {
        label: "قيد التحضير",
        color: "bg-purple-100 text-purple-800",
      },
      ready: { label: "جاهز", color: "bg-cyan-100 text-cyan-800" },
      delivering: {
        label: "قيد التوصيل",
        color: "bg-indigo-100 text-indigo-800",
      },
      out_for_delivery: {
        label: "قيد التوصيل",
        color: "bg-indigo-100 text-indigo-800",
      },
      delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800" },
      cancelled: { label: "ملغى", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig["pending"];
    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <span className="material-symbols-outlined text-6xl">error</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            الطلب غير موجود
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            لم يتم العثور على الطلب المطلوب
          </p>
          <Link
            href="/dashboard/orders"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            العودة إلى قائمة الطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/dashboard/orders"
            className="hover:text-blue-500 transition-colors"
          >
            الطلبات
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">
            #{order.id?.slice(0, 8)}
          </span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            تفاصيل الطلب #{order.id?.slice(0, 8)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            تم الإنشاء في{" "}
            {order.created_at ? formatDate(order.created_at) : "-"}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              المنتجات
            </h2>
            <div className="space-y-4">
              {order.items?.map(
                (
                  item: OrderItem & {
                    size_data?: { size_ar?: string; size_en?: string };
                    title_ar?: string;
                    title_en?: string;
                    product_name_ar?: string;
                    product_name_en?: string;
                    total_price?: number;
                    price_per_unit?: number;
                  },
                  index: number
                ) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#15203c] rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.title_ar ||
                          item.title_en ||
                          item.product_name_ar ||
                          item.product_name_en ||
                          "منتج"}
                      </h3>
                      {item.size_data && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          الحجم:{" "}
                          {item.size_data.size_ar || item.size_data.size_en}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ملاحظات: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-left mr-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        الكمية: {item.quantity}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.total_price ||
                          item.subtotal ||
                          (item.price_per_unit
                            ? item.price_per_unit * item.quantity
                            : 0)}{" "}
                        ج.م
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>المجموع الفرعي</span>
                  <span>{order.subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>رسوم التوصيل</span>
                  <span>{order.delivery_fee} ج.م</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>الإجمالي</span>
                  <span>{order.total} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ملاحظات الطلب
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أضف ملاحظات حول الطلب..."
            />
            <button
              onClick={handleUpdateNotes}
              disabled={isUpdating}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isUpdating ? "جاري التحديث..." : "تحديث الملاحظات"}
            </button>
          </div>
        </div>

        {/* Right Column - Order Info & Actions */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              تحديث الحالة
            </h2>
            <div className="space-y-2">
              {[
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "delivering",
                "delivered",
                "cancelled",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as Order["status"])}
                  disabled={isUpdating || order.status === status}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    order.status === status
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-[#15203c] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#1a2849]"
                  } disabled:opacity-50`}
                >
                  {getStatusBadge(status).props.children}
                </button>
              ))}
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              معلومات الطلب
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  طريقة الدفع
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.payment_method === "cash"
                    ? "نقداً عند الاستلام"
                    : order.payment_method === "card"
                    ? "بطاقة"
                    : order.payment_method || "نقداً"}
                </p>
              </div>
              {order.customer_name && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    اسم العميل
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.customer_name}
                  </p>
                </div>
              )}
              {order.customer_phone && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    رقم الهاتف
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.customer_phone}
                  </p>
                </div>
              )}
              {order.branch_id && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    رقم الفرع
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.branch_id.slice(0, 8)}...
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  آخر تحديث
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.updated_at ? formatDate(order.updated_at) : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {(order.delivery_type === "delivery" ||
            order.order_type === "delivery") &&
            (order.address_name || order.street) && (
              <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  عنوان التوصيل
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {order.address_name && (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.address_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.street}
                      {order.building && `, مبنى ${order.building}`}
                      {order.floor && `, طابق ${order.floor}`}
                      {order.apartment && `, شقة ${order.apartment}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.area}, {order.city}
                    </p>
                    {order.address_notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ملاحظات: {order.address_notes}
                      </p>
                    )}
                  </div>

                  {/* Google Map */}
                  {order.latitude && order.longitude && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <iframe
                        width="100%"
                        height="200"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${order.latitude},${order.longitude}&hl=ar&z=15&output=embed`}
                        allowFullScreen
                      ></iframe>
                      <div className="bg-gray-50 dark:bg-[#15203c] p-2 text-center">
                        <a
                          href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">
                            open_in_new
                          </span>
                          فتح في خرائط جوجل
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
