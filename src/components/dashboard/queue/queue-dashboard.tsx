import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
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

import {
  getOrderStatusMessageKey,
  getStatusVariant,
  useDashboardFormats,
} from "../shared/format"
import { MetricCard } from "../shared/metric-card"

export function QueueDashboard({ orders }: { orders: OrderWithItems[] }) {
  const t = useTranslations("Queue")
  const common = useTranslations("Common")
  const format = useDashboardFormats()
  const visibleOrders = orders.filter((order) =>
    ["paid", "preparing", "ready"].includes(order.status)
  )

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("inQueue")}
          note={t("inQueueNote")}
          value={format.integer(visibleOrders.length)}
        />
        <MetricCard
          label={t("readyNow")}
          note={t("readyNowNote")}
          value={format.integer(
            visibleOrders.filter((order) => order.status === "ready").length
          )}
        />
        <MetricCard
          label={t("latestToken")}
          note={t("latestTokenNote")}
          value={`#${format.integer(
            Math.max(...orders.map((order) => order.token_no), 0)
          )}`}
        />
      </div>
      {visibleOrders.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleOrders.map((order) => {
            const statusKey = getOrderStatusMessageKey(order.status)

            return (
            <Card key={order.id}>
              <CardHeader className="items-center text-center">
                <Badge variant={getStatusVariant(order.status)}>
                  {statusKey ? common(statusKey) : order.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <CardTitle className="text-5xl">
                  #{format.integer(order.token_no)}
                </CardTitle>
                <CardDescription>
                  {order.customer_label ?? t("counterFallback")}
                </CardDescription>
              </CardContent>
            </Card>
            )
          })}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
