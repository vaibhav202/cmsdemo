export const orderStatuses = [
  "paid",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const

export type OrderStatus = (typeof orderStatuses)[number]

const nextOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "preparing",
  preparing: "ready",
  ready: "completed",
}

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus)
}

export function getNextOrderStatus(
  currentStatus: string
): OrderStatus | undefined {
  if (!isOrderStatus(currentStatus)) return undefined
  return nextOrderStatus[currentStatus]
}

export function canTransitionOrder(
  currentStatus: string,
  requestedStatus: string
) {
  return getNextOrderStatus(currentStatus) === requestedStatus
}

