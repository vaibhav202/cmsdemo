import { IndianRupee } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  MenuItemWithCategory,
  OrderWithItems,
  StockItem,
} from "@/lib/supabase/types"

import { useDashboardFormats } from "../shared/format"
import { MetricCard } from "../shared/metric-card"

export function ReportsDashboard({
  menuItems,
  orders,
  stockItems,
}: {
  menuItems: MenuItemWithCategory[]
  orders: OrderWithItems[]
  stockItems: StockItem[]
}) {
  const t = useTranslations("Reports")
  const format = useDashboardFormats()
  const revenue = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((total, order) => total + Number(order.total), 0)
  const completed = orders.filter((order) => order.status === "completed").length
  const lowStock = stockItems.filter(
    (item) => Number(item.current_qty) <= Number(item.reorder_level)
  ).length
  const menuCostByName = new Map(
    menuItems.map((item) => [item.name, Number(item.cost_price)])
  )
  const estimatedCost = orders.reduce((total, order) => {
    const orderCost = order.order_items.reduce((sum, item) => {
      return sum + (menuCostByName.get(item.item_name_snapshot) ?? 0) * item.quantity
    }, 0)

    return total + orderCost
  }, 0)

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("sales")}
          note={t("salesNote")}
          value={format.currency(revenue)}
        />
        <MetricCard
          label={t("profit")}
          note={t("profitNote")}
          value={format.currency(revenue - estimatedCost)}
        />
        <MetricCard
          label={t("completed")}
          note={t("stockNote", {
            count: lowStock,
            formattedCount: format.integer(lowStock),
          })}
          value={format.integer(completed)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
          <CardAction>
            <IndianRupee />
          </CardAction>
        </CardHeader>
      </Card>
    </>
  )
}
