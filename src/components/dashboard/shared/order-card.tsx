import { ArrowRight } from "lucide-react"

import { advanceOrderAction } from "@/app/actions/workspace-operations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { OrderWithItems } from "@/lib/supabase/types"

import {
  formatCurrency,
  getStatusVariant,
  nextStatusLabel,
  statusLabel,
} from "./format"

function OrderStatusAction({
  order,
  vendorSlug,
}: {
  order: OrderWithItems
  vendorSlug: string
}) {
  const label = nextStatusLabel[order.status]

  if (!label) return null

  return (
    <form action={advanceOrderAction}>
      <input name="vendorSlug" type="hidden" value={vendorSlug} />
      <input name="orderId" type="hidden" value={order.id} />
      <input name="status" type="hidden" value={order.status} />
      <Button size="sm" type="submit" variant="outline">
        {label}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </form>
  )
}

function OrderLineItems({ order }: { order: OrderWithItems }) {
  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
      {order.order_items.map((item) => (
        <p key={item.id}>
          {item.quantity} x {item.item_name_snapshot}
        </p>
      ))}
    </div>
  )
}

export function OrderCard({
  compact = false,
  order,
  vendorSlug,
}: {
  compact?: boolean
  order: OrderWithItems
  vendorSlug: string
}) {
  return (
    <Card size={compact ? "sm" : "default"}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">#{order.token_no}</span>
            <Badge variant={getStatusVariant(order.status)}>
              {statusLabel[order.status] ?? order.status}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          {order.customer_label ?? "Counter"} ·{" "}
          {formatCurrency(Number(order.total))}
        </CardDescription>
        {!compact ? (
          <CardAction>
            <OrderStatusAction order={order} vendorSlug={vendorSlug} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <OrderLineItems order={order} />
      </CardContent>
    </Card>
  )
}
