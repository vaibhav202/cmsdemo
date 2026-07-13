import { IndianRupee } from "lucide-react"

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

import { formatCurrency } from "../shared/format"
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
          label="Sales"
          note="Paid counter orders"
          value={formatCurrency(revenue)}
        />
        <MetricCard
          label="Estimated gross profit"
          note="Based on item cost prices"
          value={formatCurrency(revenue - estimatedCost)}
        />
        <MetricCard
          label="Completed orders"
          note={`${lowStock} stock item(s) low`}
          value={String(completed)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Owner summary</CardTitle>
          <CardDescription>
            Sales, estimated cost, gross profit, order count, and stock warnings
            stay connected with daily counter and kitchen work.
          </CardDescription>
          <CardAction>
            <IndianRupee />
          </CardAction>
        </CardHeader>
      </Card>
    </>
  )
}
