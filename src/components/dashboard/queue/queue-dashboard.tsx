import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import type { OrderWithItems } from "@/lib/supabase/types"

import { statusLabel } from "../shared/format"
import { MetricCard } from "../shared/metric-card"

export function QueueDashboard({ orders }: { orders: OrderWithItems[] }) {
  const visibleOrders = orders.filter((order) =>
    ["paid", "preparing", "ready"].includes(order.status)
  )

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="In queue"
          note="Visible to staff/customer screen"
          value={String(visibleOrders.length)}
        />
        <MetricCard
          label="Ready now"
          note="Tokens waiting for pickup"
          value={String(visibleOrders.filter((order) => order.status === "ready").length)}
        />
        <MetricCard
          label="Latest token"
          note="Counter sequence"
          value={`#${Math.max(...orders.map((order) => order.token_no), 0)}`}
        />
      </div>
      {visibleOrders.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="items-center text-center">
                <Badge
                  variant={order.status === "ready" ? "default" : "outline"}
                >
                  {statusLabel[order.status]}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <CardTitle className="text-5xl">#{order.token_no}</CardTitle>
                <CardDescription>
                  {order.customer_label ?? "Counter"}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No visible queue</EmptyTitle>
            <EmptyDescription>
              Paid, preparing, and ready orders will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
