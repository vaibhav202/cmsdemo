import { CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import type {
  MenuItemWithCategory,
  OrderWithItems,
} from "@/lib/supabase/types"

import { formatCurrency, isActiveOrder } from "../shared/format"
import { MetricCard } from "../shared/metric-card"
import { OrderCard } from "../shared/order-card"
import { CounterMenu } from "./counter-menu"

export function OrderDashboard({
  menuItems,
  orders,
  vendorId,
  vendorSlug,
}: {
  menuItems: MenuItemWithCategory[]
  orders: OrderWithItems[]
  vendorId: string
  vendorSlug: string
}) {
  const activeOrders = orders.filter(isActiveOrder)
  const paidOrders = orders.filter((order) => order.payment_status === "paid")
  const sales = paidOrders.reduce((total, order) => total + Number(order.total), 0)

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Counter sales"
          note="Paid counter orders"
          value={formatCurrency(sales)}
        />
        <MetricCard
          label="Active tokens"
          note="Paid, preparing, or ready"
          value={String(activeOrders.length)}
        />
        <MetricCard
          label="Available items"
          note="Menu items currently in stock"
          value={String(menuItems.filter((item) => item.in_stock).length)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CounterMenu
          menuItems={menuItems}
          vendorId={vendorId}
          vendorSlug={vendorSlug}
        />

        <aside className="flex flex-col gap-3">
          <CardTitle>Active orders</CardTitle>
          {activeOrders.length ? (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} vendorSlug={vendorSlug} />
            ))
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No active orders</EmptyTitle>
                <EmptyDescription>
                  New paid orders will appear here after the undo window.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </aside>
      </div>
    </>
  )
}
