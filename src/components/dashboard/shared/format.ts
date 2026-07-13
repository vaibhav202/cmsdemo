import type { OrderWithItems } from "@/lib/supabase/types"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

const currency = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
})

export const statusLabel: Record<string, string> = {
  paid: "Paid",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const nextStatusLabel: Record<string, string> = {
  paid: "Send to kitchen",
  preparing: "Mark ready",
  ready: "Complete",
}

export function formatCurrency(value: number) {
  return currency.format(value)
}

export function getStatusVariant(status: string): BadgeVariant {
  if (status === "ready") return "default"
  if (status === "completed") return "secondary"
  if (status === "cancelled") return "destructive"
  return "outline"
}

export function isActiveOrder(order: OrderWithItems) {
  return !["completed", "cancelled"].includes(order.status)
}
