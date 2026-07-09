import { Order } from "@/services/apiOrders";

export interface StatusConfig {
  label: string;
  color: string;
  dot: string;
}

export const ORDER_STATUS_CONFIG: Record<Order["status"], StatusConfig> = {
  pending: {
    label: "قيد الانتظار",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  pending_payment: {
    label: "بانتظار الدفع",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  confirmed: {
    label: "تم الدفع",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "قيد التحضير",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  ready: {
    label: "جاهز",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  delivering: {
    label: "قيد التوصيل",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  out_for_delivery: {
    label: "قيد التوصيل",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "تم التوصيل",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "ملغي",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export const ORDER_TYPE_CONFIG: Record<
  Order["order_type"],
  { label: string; icon: string }
> = {
  delivery: { label: "توصيل", icon: "delivery_dining" },
  takeaway: { label: "استلام", icon: "shopping_bag" },
  "dine-in": { label: "داخل المطعم", icon: "restaurant" },
};

export function getStatusConfig(status: Order["status"]): StatusConfig {
  return (
    ORDER_STATUS_CONFIG[status] ?? {
      label: status,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      dot: "bg-gray-400",
    }
  );
}

export function formatOrderDate(dateString?: string): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    calendar: "gregory",
  }).format(new Date(dateString));
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "—";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} د`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `منذ ${diffHours} س`;
  return formatOrderDate(dateString);
}

export function getOrderDisplayId(order: Order): string {
  return order.order_number || `#${order.id?.slice(0, 8) || "—"}`;
}

export function getItemCount(order: Order): number {
  return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}
