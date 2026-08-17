"use client"

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  cancelOrderAction,
  createOrderAction,
  type CreatedOrderResult,
} from "@/features/orders/actions"
import {
  maxCartLineQuantity,
  paymentModes,
  type PaymentMode,
} from "@/features/orders/commands"
import type { MenuItemWithCategory } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

export type OrderCartLine = {
  item: MenuItemWithCategory
  quantity: number
}

type OrderCartProps = {
  className?: string
  lines: OrderCartLine[]
  onClearAction: () => void
  onRemoveAction: (menuItemId: string) => void
  onQuantityChangeAction: (menuItemId: string, quantity: number) => void
  vendorSlug: string
}

function getCartTotal(lines: OrderCartLine[]) {
  return lines.reduce(
    (total, line) => total + Number(line.item.price) * line.quantity,
    0
  )
}

export function OrderCart({
  className,
  lines,
  onClearAction,
  onRemoveAction,
  onQuantityChangeAction,
  vendorSlug,
}: OrderCartProps) {
  const t = useTranslations("Order")
  const common = useTranslations("Common.actions")
  const format = useDashboardFormats()
  const [customerLabel, setCustomerLabel] = useState("")
  const [note, setNote] = useState("")
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash")
  const [pending, setPending] = useState(false)
  const total = getCartTotal(lines)
  const totalQuantity = lines.reduce((count, line) => count + line.quantity, 0)

  async function undoOrder(order: CreatedOrderResult) {
    const formData = new FormData()
    formData.set("orderId", order.id)
    formData.set("vendorSlug", vendorSlug)

    try {
      await cancelOrderAction(formData)
      toast.success(t("feedback.cancelledTitle"), {
        description: t("feedback.cancelledDescription", {
          token: order.tokenNo,
        }),
      })
    } catch {
      toast.error(t("errors.cancel"))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lines.length || pending) return

    const formData = new FormData()
    formData.set("customerLabel", customerLabel)
    formData.set("idempotencyKey", createIdempotencyKey())
    formData.set(
      "lines",
      JSON.stringify(
        lines.map((line) => ({
          menuItemId: line.item.id,
          quantity: line.quantity,
        }))
      )
    )
    formData.set("note", note)
    formData.set("paymentMode", paymentMode)
    formData.set("vendorSlug", vendorSlug)

    setPending(true)

    try {
      const order = await createOrderAction(formData)
      onClearAction()
      setCustomerLabel("")
      setNote("")
      toast.success(t("feedback.createdTitle"), {
        action: {
          label: common("undo"),
          onClick: () => void undoOrder(order),
        },
        description: t("feedback.createdDescription", {
          token: order.tokenNo,
          total: format.currency(order.total),
        }),
        duration: 10_500,
      })
    } catch (error) {
      toast.error(t("feedback.failedTitle"), {
        description:
          error instanceof Error ? error.message : t("errors.create"),
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <Card
      className={cn("order-first lg:order-last lg:sticky lg:top-24", className)}
      data-order-cart
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart data-icon="inline-start" />
          {t("cartTitle")}
          <Badge
            className="ml-auto"
            data-cart-total
            variant="secondary"
          >
            {format.integer(totalQuantity)}
          </Badge>
        </CardTitle>
        <CardDescription>
          {lines.length
            ? format.currency(total)
            : t("cartEmptyDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {lines.length ? (
          <div className="flex flex-col gap-3">
            {lines.map((line) => (
              <div
                className="flex items-center gap-2 rounded-lg border p-3"
                data-cart-line
                key={line.item.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {line.item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format.currency(Number(line.item.price))}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={t("decreaseItem", { item: line.item.name })}
                    disabled={pending || line.quantity <= 1}
                    onClick={() =>
                      onQuantityChangeAction(line.item.id, line.quantity - 1)
                    }
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Minus />
                  </Button>
                  <span className="min-w-6 text-center text-sm tabular-nums">
                    {format.quantity(line.quantity)}
                  </span>
                  <Button
                    aria-label={t("increaseItem", { item: line.item.name })}
                    disabled={pending || line.quantity >= maxCartLineQuantity}
                    onClick={() =>
                      onQuantityChangeAction(line.item.id, line.quantity + 1)
                    }
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus />
                  </Button>
                  <Button
                    aria-label={t("removeItem", { item: line.item.name })}
                    disabled={pending}
                    onClick={() => onRemoveAction(line.item.id)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{t("cartEmptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("cartEmptyDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <form
          className="flex flex-col gap-4"
          data-order-checkout
          onSubmit={handleSubmit}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="order-customer-label">
                {t("customer")}
              </FieldLabel>
              <Input
                disabled={pending}
                id="order-customer-label"
                onChange={(event) => setCustomerLabel(event.target.value)}
                placeholder={t("counterDefault")}
                value={customerLabel}
              />
            </Field>

            <Field>
              <FieldLabel>{t("payment")}</FieldLabel>
              <ToggleGroup
                aria-label={t("payment")}
                className="grid w-full grid-cols-3"
                onValueChange={(value) => {
                  if (value) setPaymentMode(value as PaymentMode)
                }}
                spacing={1}
                type="single"
                value={paymentMode}
                variant="outline"
              >
                {paymentModes.map((mode) => (
                  <ToggleGroupItem key={mode} value={mode}>
                    {t(`paymentModes.${mode}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="order-note">{t("note")}</FieldLabel>
              <Textarea
                disabled={pending}
                id="order-note"
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("notePlaceholder")}
                value={note}
              />
            </Field>
          </FieldGroup>

          <Button disabled={!lines.length || pending} type="submit">
            {pending ? t("booking") : t("bookOrder")}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!lines.length || pending}
          onClick={onClearAction}
          type="button"
          variant="outline"
        >
          {t("clearCart")}
        </Button>
      </CardFooter>
    </Card>
  )
}

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0
    const value = character === "x" ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}
