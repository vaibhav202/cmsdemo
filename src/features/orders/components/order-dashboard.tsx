"use client"

import { useTranslations } from "next-intl"
import type {
  MenuItemWithCategory,
  OrderWithItems,
} from "@/lib/supabase/types"

import {
  isActiveOrder,
  useDashboardFormats,
} from "@/components/dashboard/shared/format"
import { MetricCard } from "@/components/dashboard/shared/metric-card"
import { useActiveOrders } from "@/components/shell/active-orders-context"
import { CounterMenu } from "./counter-menu"

export function OrderDashboard({
  menuItems,
  orders,
  vendorSlug,
}: {
  menuItems: MenuItemWithCategory[]
  orders: OrderWithItems[]
  vendorSlug: string
}) {
  const t = useTranslations("Order")
  const shell = useTranslations("Shell")
  const format = useDashboardFormats()
  const { toggle } = useActiveOrders()
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
        <div
          aria-label={shell("openActiveOrders")}
          className="cursor-pointer transition-opacity hover:opacity-90 active:scale-[0.99]"
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              toggle()
            }
          }}
          role="button"
          tabIndex={0}
        >
          <MetricCard
            label={t("metrics.active")}
            note={t("metrics.activeNote")}
            value={format.integer(activeOrders.length)}
          />
        </div>
        <MetricCard
          label={t("metrics.available")}
          note={t("metrics.availableNote")}
          value={format.integer(
            menuItems.filter((item) => item.in_stock).length
          )}
        />
      </div>

      <CounterMenu menuItems={menuItems} vendorSlug={vendorSlug} />
    </>
  )
}
