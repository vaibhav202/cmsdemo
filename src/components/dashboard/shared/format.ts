import { useFormatter } from "next-intl"

import type { OrderWithItems } from "@/lib/supabase/types"

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "paid"
  | "preparing"
  | "ready"

const orderStatusMessageKeys = {
  paid: "orderStatus.paid",
  preparing: "orderStatus.preparing",
  ready: "orderStatus.ready",
  completed: "orderStatus.completed",
  cancelled: "orderStatus.cancelled",
} as const

export function getOrderStatusMessageKey(status: string) {
  return orderStatusMessageKeys[
    status as keyof typeof orderStatusMessageKeys
  ]
}

export function useDashboardFormats() {
  const format = useFormatter()

  return {
    currency(value: number) {
      return format.number(value, "currency")
    },
    integer(value: number) {
      return format.number(value, "integer")
    },
    quantity(value: number) {
      return format.number(value, "quantity")
    },
  }
}

export function getStatusVariant(status: string): BadgeVariant {
  if (status === "paid") return "paid"
  if (status === "preparing") return "preparing"
  if (status === "ready") return "ready"
  if (status === "completed") return "secondary"
  if (status === "cancelled") return "destructive"
  return "outline"
}

export function isActiveOrder(order: OrderWithItems) {
  return !["completed", "cancelled"].includes(order.status)
}
