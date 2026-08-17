"use client"

import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  Minus,
  Plus,
  RotateCcw,
  ShoppingCart,
  Store,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { ElapsedTime } from "@/features/orders/components/elapsed-time"
import {
  getOrderStatusMessageKey,
  getStatusVariant,
} from "@/components/dashboard/shared/format"

const demoMenu = [
  { id: "poha", name: "Poha", price: 45 },
  { id: "misal", name: "Misal pav", price: 90 },
  { id: "tea", name: "Cutting chai", price: 25 },
  { id: "thali", name: "Mini thali", price: 140 },
] as const

type DemoRole = "owner" | "cashier" | "kitchen" | "queue"
type DemoStatus = "paid" | "preparing" | "ready"
type DemoOrder = {
  createdAt: string
  customer: string
  id: string
  itemCount: number
  status: DemoStatus
  token: number
  total: number
}
type DemoCartLine = {
  itemId: (typeof demoMenu)[number]["id"]
  quantity: number
}

const subscribeToHydration = () => () => {}
const getClientHydrationState = () => true
const getServerHydrationState = () => false

function createDemoOrders(): DemoOrder[] {
  const now = Date.now()

  return [
    {
      createdAt: new Date(now - 12 * 60_000).toISOString(),
      customer: "Table 4",
      id: "demo-order-248",
      itemCount: 3,
      status: "preparing",
      token: 248,
      total: 315,
    },
    {
      createdAt: new Date(now - 7 * 60_000).toISOString(),
      customer: "Counter 2",
      id: "demo-order-249",
      itemCount: 2,
      status: "paid",
      token: 249,
      total: 135,
    },
    {
      createdAt: new Date(now - 3 * 60_000).toISOString(),
      customer: "Table 1",
      id: "demo-order-250",
      itemCount: 1,
      status: "ready",
      token: 250,
      total: 140,
    },
  ]
}

function getNextStatus(status: DemoStatus): DemoStatus | undefined {
  if (status === "paid") return "preparing"
  if (status === "preparing") return "ready"
  return undefined
}

export function LiveDemo() {
  const t = useTranslations("Public")
  const common = useTranslations("Common")
  const orderT = useTranslations("Order")
  const format = useDashboardFormats()
  const [role, setRole] = useState<DemoRole>("owner")
  const [orders, setOrders] = useState<DemoOrder[]>(createDemoOrders)
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationState,
    getServerHydrationState
  )
  const [cart, setCart] = useState<DemoCartLine[]>([])
  const [customer, setCustomer] = useState("")

  const cartTotal = cart.reduce((total, line) => {
    const item = demoMenu.find((candidate) => candidate.id === line.itemId)
    return total + (item?.price ?? 0) * line.quantity
  }, 0)
  const activeOrders = orders.filter((order) => order.status !== "ready")
  const readyOrders = orders.filter((order) => order.status === "ready")

  function addToCart(itemId: DemoCartLine["itemId"]) {
    setCart((current) => {
      const existing = current.find((line) => line.itemId === itemId)
      if (!existing) return [...current, { itemId, quantity: 1 }]

      return current.map((line) =>
        line.itemId === itemId
          ? { ...line, quantity: Math.min(20, line.quantity + 1) }
          : line
      )
    })
  }

  function changeCartQuantity(itemId: DemoCartLine["itemId"], quantity: number) {
    if (quantity < 1) {
      setCart((current) => current.filter((line) => line.itemId !== itemId))
      return
    }

    setCart((current) =>
      current.map((line) =>
        line.itemId === itemId
          ? { ...line, quantity: Math.min(20, quantity) }
          : line
      )
    )
  }

  function bookDemoOrder() {
    if (!cart.length) return

    const token = Math.max(...orders.map((order) => order.token), 250) + 1
    setOrders((current) => [
      {
        createdAt: new Date().toISOString(),
        customer: customer.trim() || t("demo.counterFallback"),
        id: `demo-order-${token}`,
        itemCount: cart.reduce((count, line) => count + line.quantity, 0),
        status: "paid",
        token,
        total: cartTotal,
      },
      ...current,
    ])
    setCart([])
    setCustomer("")
    toast.success(t("demo.booked", { token }))
  }

  function advanceOrder(orderId: string) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order
        const nextStatus = getNextStatus(order.status)
        return nextStatus ? { ...order, status: nextStatus } : order
      })
    )
  }

  function resetDemo() {
    setOrders(createDemoOrders())
    setCart([])
    setCustomer("")
    toast.success(t("demo.resetDone"))
  }

  const roleOptions: Array<{
    icon: typeof Store
    label: string
    value: DemoRole
  }> = [
    { icon: Store, label: t("demo.roles.owner"), value: "owner" },
    { icon: ClipboardList, label: t("demo.roles.cashier"), value: "cashier" },
    { icon: ChefHat, label: t("demo.roles.kitchen"), value: "kitchen" },
    { icon: ClipboardList, label: t("demo.roles.queue"), value: "queue" },
  ]

  return (
    <div
      className="flex flex-col gap-6"
      data-demo-hydrated={isHydrated ? "true" : "false"}
      data-public-demo
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex max-w-3xl flex-col gap-3">
          <Badge className="w-fit" variant="outline">
            {t("demo.eyebrow")}
          </Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("demo.title")}
          </h1>
          <p className="text-muted-foreground">{t("demo.description")}</p>
          <p className="text-sm text-muted-foreground">{t("demo.safeNotice")}</p>
        </div>
        <Button onClick={resetDemo} type="button" variant="outline">
          <RotateCcw data-icon="inline-start" />
          {t("demo.reset")}
        </Button>
      </div>

      <ToggleGroup
        aria-label={t("demo.roleLabel")}
        className="grid w-full grid-cols-2 sm:grid-cols-4"
        data-demo-role
        onValueChange={(value) => {
          if (value) setRole(value as DemoRole)
        }}
        spacing={1}
        type="single"
        value={role}
        variant="outline"
      >
        {roleOptions.map(({ icon: Icon, label, value }) => (
          <ToggleGroupItem className="h-auto min-h-12 gap-2" key={value} value={value}>
            <Icon data-icon="inline-start" />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {role === "owner" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <DemoMetric label={t("demo.orders")} value={format.integer(orders.length)} />
            <DemoMetric label={t("demo.active")} value={format.integer(activeOrders.length)} />
            <DemoMetric
              label={t("demo.ready")}
              value={format.integer(readyOrders.length)}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("demo.ownerTitle")}</CardTitle>
              <CardDescription>{t("demo.ownerDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {orders.map((order) => (
                <DemoOrderSummary
                  common={common}
                  format={format}
                  key={order.id}
                  order={order}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {role === "cashier" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card>
            <CardHeader>
              <CardTitle>{t("demo.menuTitle")}</CardTitle>
              <CardDescription>{t("demo.menuDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {demoMenu.map((item) => (
                <Card key={item.id} size="sm">
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{format.currency(item.price)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => addToCart(item.id)} size="sm" type="button">
                      <Plus data-icon="inline-start" />
                      {t("demo.add")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-24 lg:self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart data-icon="inline-start" />
                {t("demo.cartTitle")}
                <Badge
                  className="ml-auto"
                  data-demo-cart-total
                  variant="secondary"
                >
                  {format.integer(
                    cart.reduce((count, line) => count + line.quantity, 0)
                  )}
                </Badge>
              </CardTitle>
              <CardDescription>
                {cart.length ? format.currency(cartTotal) : t("demo.emptyCart")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {cart.length ? (
                <div className="flex flex-col gap-2">
                  {cart.map((line) => {
                    const item = demoMenu.find((candidate) => candidate.id === line.itemId)
                    if (!item) return null

                    return (
                      <div className="flex items-center gap-2 rounded-lg border p-2" key={line.itemId}>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.name}
                        </span>
                        <Button
                          aria-label={t("demo.decrease", { item: item.name })}
                          onClick={() => changeCartQuantity(item.id, line.quantity - 1)}
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <Minus />
                        </Button>
                        <span className="min-w-5 text-center text-sm tabular-nums">
                          {format.quantity(line.quantity)}
                        </span>
                        <Button
                          aria-label={t("demo.increase", { item: item.name })}
                          onClick={() => changeCartQuantity(item.id, line.quantity + 1)}
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <Plus />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyTitle>{t("demo.emptyCartTitle")}</EmptyTitle>
                    <EmptyDescription>{t("demo.emptyCart")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="demo-customer">{t("demo.customer")}</FieldLabel>
                  <Input
                    id="demo-customer"
                    onChange={(event) => setCustomer(event.target.value)}
                    placeholder={t("demo.customerPlaceholder")}
                    value={customer}
                  />
                </Field>
              </FieldGroup>
              <Button disabled={!cart.length} onClick={bookDemoOrder} type="button">
                {t("demo.book")}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {role === "kitchen" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("demo.kitchenTitle")}</CardTitle>
            <CardDescription>{t("demo.kitchenDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <DemoKitchenOrder
                common={common}
                format={format}
                key={order.id}
                onAdvance={() => advanceOrder(order.id)}
                order={order}
                orderT={orderT}
                t={t}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {role === "queue" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("demo.queueTitle")}</CardTitle>
            <CardDescription>{t("demo.queueDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {orders.map((order) => (
              <Card key={order.id} size="sm">
                <CardHeader className="items-center text-center">
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusLabel(common, order.status)}
                  </Badge>
                  <CardTitle className="mt-2 text-4xl">#{format.integer(order.token)}</CardTitle>
                  <CardDescription>{order.customer}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ElapsedTime createdAt={order.createdAt} />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function DemoMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function DemoOrderSummary({
  common,
  format,
  order,
}: {
  common: ReturnType<typeof useTranslations>
  format: ReturnType<typeof useDashboardFormats>
  order: DemoOrder
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">#{format.integer(order.token)}</span>
        <span className="truncate text-sm text-muted-foreground">{order.customer}</span>
        <ElapsedTime createdAt={order.createdAt} />
      </div>
      <Badge variant={getStatusVariant(order.status)}>
        {getStatusLabel(common, order.status)}
      </Badge>
    </div>
  )
}

function DemoKitchenOrder({
  common,
  format,
  onAdvance,
  order,
  orderT,
  t,
}: {
  common: ReturnType<typeof useTranslations>
  format: ReturnType<typeof useDashboardFormats>
  onAdvance: () => void
  order: DemoOrder
  orderT: ReturnType<typeof useTranslations>
  t: ReturnType<typeof useTranslations>
}) {
  const nextStatus = getNextStatus(order.status)
  const nextLabel = nextStatus
    ? orderT(`nextStatus.${order.status}`)
    : t("demo.readyStatus")

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>#{format.integer(order.token)}</CardTitle>
            <CardDescription>{order.customer}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(order.status)}>
            {getStatusLabel(common, order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("demo.items", { count: order.itemCount })}</span>
          <ElapsedTime createdAt={order.createdAt} />
        </div>
        <Button disabled={!nextStatus} onClick={onAdvance} size="sm" type="button">
          {nextLabel}
          {nextStatus ? <ArrowRight data-icon="inline-end" /> : null}
        </Button>
      </CardContent>
    </Card>
  )
}

function getStatusLabel(
  common: ReturnType<typeof useTranslations>,
  status: DemoStatus
) {
  const key = getOrderStatusMessageKey(status)
  return key ? common(key) : status
}

