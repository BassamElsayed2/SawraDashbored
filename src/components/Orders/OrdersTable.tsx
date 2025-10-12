"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order } from "@/services/apiOrders";

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onStatusChange?: (orderId: string, status: Order["status"]) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  onStatusChange,
}) => {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig: Record<
      Order["status"],
      { label: string; color: string }
    > = {
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
      delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800" },
      cancelled: { label: "ملغى", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getDeliveryTypeBadge = (type: "delivery" | "pickup") => {
    return type === "delivery" ? (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
        توصيل
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        استلام
      </span>
    );
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    if (onStatusChange) {
      setUpdatingOrderId(orderId);
      await onStatusChange(orderId, newStatus);
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <span className="material-symbols-outlined text-6xl">
            shopping_cart
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          لا توجد طلبات
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          لم يتم العثور على طلبات بناءً على الفلاتر المحددة
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#15203c] border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                رقم الطلب
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                عدد المنتجات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الإجمالي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                تغيير الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    #{order.id.slice(0, 8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(order.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getDeliveryTypeBadge(order.delivery_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    منتج
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {order.total} ج.م
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        e.target.value as Order["status"]
                      )
                    }
                    disabled={updatingOrderId === order.id}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="preparing">قيد التحضير</option>
                    <option value="ready">جاهز</option>
                    <option value="delivering">قيد التوصيل</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    عرض التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
