import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { useTranslations } from "next-intl"
import type { OrderWithItems } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { MetricCard } from "@/components/dashboard/shared/metric-card"
import { OrderCard } from "@/components/dashboard/shared/order-card"

export function KitchenDashboard({
  orders,
  vendorSlug,
}: {
  orders: OrderWithItems[]
  vendorSlug: string
}) {
  const t = useTranslations("Kitchen")
  const format = useDashboardFormats()
  const kitchenOrders = orders.filter((order) =>
    ["paid", "preparing", "ready"].includes(order.status)
  )

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("waiting")}
          note={t("waitingNote")}
          value={format.integer(
            orders.filter((order) => order.status === "paid").length
          )}
        />
        <MetricCard
          label={t("preparing")}
          note={t("preparingNote")}
          value={format.integer(
            orders.filter((order) => order.status === "preparing").length
          )}
        />
        <MetricCard
          label={t("ready")}
          note={t("readyNote")}
          value={format.integer(
            orders.filter((order) => order.status === "ready").length
          )}
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
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
