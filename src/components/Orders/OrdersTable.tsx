"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order } from "@/services/apiOrders";

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onStatusChange?: (orderId: string, status: Order["status"]) => void;
  onDelete?: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  onStatusChange,
  onDelete,
}) => {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig: Record<
      Order["status"],
      { label: string; color: string }
    > = {
      pending: {
        label: "قيد الانتظار",
        color: "bg-yellow-100 text-yellow-800",
      },
      pending_payment: {
        label: "بانتظار الدفع",
        color: "bg-orange-100 text-orange-800",
      },
      confirmed: { label: "تم الدفع", color: "bg-blue-100 text-blue-800" },
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

    const config = statusConfig[status];

    // Fallback for unknown status
    if (!config) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
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
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    }).format(date);
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete && onDelete) {
      setDeletingOrderId(orderToDelete);
      await onDelete(orderToDelete);
      setDeletingOrderId(null);
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
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
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  تأكيد الحذف
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  هل أنت متأكد من حذف هذا الطلب؟
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ تحذير: لا يمكن التراجع عن هذا الإجراء. سيتم حذف الطلب وجميع
                بياناته بشكل نهائي.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deletingOrderId !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingOrderId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingOrderId ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-base">
                      progress_activity
                    </span>
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
                    نعم، احذف الطلب
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0c1427] rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#15203c] border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  رقم الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  اسم العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التاريخ
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
                      {order.id?.slice(0, 8) || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.customer_name || "غير محدد"}
                    </div>
                    {order.customer_phone && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.customer_phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {order.created_at ? formatDate(order.created_at) : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.items?.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      ) || 0}{" "}
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
                        order.id &&
                        handleStatusChange(
                          order.id,
                          e.target.value as Order["status"]
                        )
                      }
                      disabled={updatingOrderId === order.id || !order.id}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-[#0c1427] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="pending_payment">بانتظار الدفع</option>
                      <option value="confirmed">تم الدفع</option>
                      <option value="preparing">قيد التحضير</option>
                      <option value="delivering">قيد التوصيل</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/orders/${order.id || ""}`}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">
                          visibility
                        </span>
                        عرض
                      </Link>
                      {onDelete && (
                        <button
                          onClick={() =>
                            order.id && handleDeleteClick(order.id)
                          }
                          disabled={deletingOrderId === order.id || !order.id}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-base">
                            delete
                          </span>
                          حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
