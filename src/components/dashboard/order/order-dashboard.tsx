import { CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
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

import { isActiveOrder, useDashboardFormats } from "../shared/format"
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
  const t = useTranslations("Order")
  const format = useDashboardFormats()
  const activeOrders = orders.filter(isActiveOrder)
  const paidOrders = orders.filter((order) => order.payment_status === "paid")
  const sales = paidOrders.reduce((total, order) => total + Number(order.total), 0)

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("metrics.sales")}
          note={t("metrics.salesNote")}
          value={format.currency(sales)}
        />
        <MetricCard
          label={t("metrics.active")}
          note={t("metrics.activeNote")}
          value={format.integer(activeOrders.length)}
        />
        <MetricCard
          label={t("metrics.available")}
          note={t("metrics.availableNote")}
          value={format.integer(
            menuItems.filter((item) => item.in_stock).length
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <CounterMenu
          menuItems={menuItems}
          vendorId={vendorId}
          vendorSlug={vendorSlug}
        />

        <aside className="flex flex-col gap-3">
          <CardTitle>{t("activeOrders")}</CardTitle>
          {activeOrders.length ? (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} vendorSlug={vendorSlug} />
            ))
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </aside>
      </div>
    </>
  )
}
