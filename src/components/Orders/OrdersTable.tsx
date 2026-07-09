"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order } from "@/services/apiOrders";
import {
  getStatusConfig,
  ORDER_TYPE_CONFIG,
  formatOrderDate,
  formatRelativeTime,
  getOrderDisplayId,
  getItemCount,
} from "@/lib/order-status";

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onStatusChange?: (orderId: string, status: Order["status"]) => void;
  onDelete?: (orderId: string) => void;
}

const STATUS_OPTIONS: { value: Order["status"]; label: string }[] = [
  { value: "pending_payment", label: "بانتظار الدفع" },
  { value: "confirmed", label: "تم الدفع" },
  { value: "preparing", label: "قيد التحضير" },
  { value: "ready", label: "جاهز" },
  { value: "delivering", label: "قيد التوصيل" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

function CustomerAvatar({ name }: { name: string }) {
  const initial = (name || "؟").charAt(0).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
      {initial}
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#172036] dark:bg-[#0c1427]">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-xl p-4"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center dark:border-[#172036] dark:bg-[#0c1427]">
        <span className="material-symbols-outlined mb-4 block text-6xl text-gray-300 dark:text-gray-600">
          receipt_long
        </span>
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          لا توجد طلبات
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          لم يتم العثور على طلبات بناءً على الفلاتر المحددة
        </p>
      </div>
    );
  }

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-[#172036] dark:bg-[#0c1427]"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  تأكيد الحذف
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  هل أنت متأكد من حذف هذا الطلب؟
                </p>
              </div>
            </div>
            <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                لا يمكن التراجع عن هذا الإجراء. سيتم حذف الطلب نهائياً.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
                disabled={deletingOrderId !== null}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingOrderId !== null}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingOrderId ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">
                      progress_activity
                    </span>
                    جاري الحذف...
                  </>
                ) : (
                  "نعم، احذف"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => {
          const typeConfig = ORDER_TYPE_CONFIG[order.order_type];
          return (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#172036] dark:bg-[#0c1427]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <CustomerAvatar name={order.customer_name || ""} />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {getOrderDisplayId(order)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_name || "غير محدد"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <span className="material-symbols-outlined text-[14px]">
                    {typeConfig?.icon || "receipt"}
                  </span>
                  {typeConfig?.label || order.order_type}
                </span>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {getItemCount(order)} منتج
                </span>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {formatRelativeTime(order.created_at)}
                </span>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {Number(order.total).toLocaleString()} ج.م
                </span>
                <Link
                  href={`/dashboard/orders/${order.id || ""}/`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400"
                >
                  التفاصيل
                  <span className="material-symbols-outlined text-[16px]">
                    chevron_left
                  </span>
                </Link>
              </div>

              <select
                value={order.status}
                onChange={(e) =>
                  order.id &&
                  handleStatusChange(order.id, e.target.value as Order["status"])
                }
                disabled={updatingOrderId === order.id || !order.id}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm disabled:opacity-50 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[#172036] dark:bg-[#0c1427] md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-[#172036] dark:bg-gray-800/30">
                {[
                  "الطلب",
                  "العميل",
                  "النوع",
                  "التاريخ",
                  "المنتجات",
                  "الإجمالي",
                  "الحالة",
                  "تحديث الحالة",
                  "إجراءات",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#172036]">
              {orders.map((order) => {
                const typeConfig = ORDER_TYPE_CONFIG[order.order_type];
                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-gray-50/80 dark:hover:bg-gray-800/20"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getOrderDisplayId(order)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(order.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={order.customer_name || ""} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.customer_name || "غير محدد"}
                          </p>
                          {order.customer_phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.customer_phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">
                          {typeConfig?.icon || "receipt"}
                        </span>
                        {typeConfig?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatOrderDate(order.created_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {getItemCount(order)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {Number(order.total).toLocaleString()} ج.م
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4">
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
                        className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm disabled:opacity-50 dark:border-[#172036] dark:bg-gray-800/40 dark:text-white"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/orders/${order.id || ""}/`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary-600 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                          title="عرض التفاصيل"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            visibility
                          </span>
                        </Link>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              order.id && handleDeleteClick(order.id)
                            }
                            disabled={deletingOrderId === order.id || !order.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
                            title="حذف"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
