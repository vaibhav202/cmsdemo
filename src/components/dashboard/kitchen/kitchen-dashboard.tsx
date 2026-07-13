import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import type { OrderWithItems } from "@/lib/supabase/types"

import { MetricCard } from "../shared/metric-card"
import { OrderCard } from "../shared/order-card"

export function KitchenDashboard({
  orders,
  vendorSlug,
}: {
  orders: OrderWithItems[]
  vendorSlug: string
}) {
  const kitchenOrders = orders.filter((order) =>
    ["paid", "preparing", "ready"].includes(order.status)
  )

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Waiting"
          note="Paid orders not started"
          value={String(orders.filter((order) => order.status === "paid").length)}
        />
        <MetricCard
          label="Preparing"
          note="Kitchen is working on these"
          value={String(orders.filter((order) => order.status === "preparing").length)}
        />
        <MetricCard
          label="Ready"
          note="Can be handed over"
          value={String(orders.filter((order) => order.status === "ready").length)}
        />
      </div>
      {kitchenOrders.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {kitchenOrders.map((order) => (
            <OrderCard key={order.id} order={order} vendorSlug={vendorSlug} />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No kitchen orders</EmptyTitle>
            <EmptyDescription>
              Paid counter orders will appear here for preparation.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
