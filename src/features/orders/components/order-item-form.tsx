"use client"

import { Minus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { type FormEvent, useState } from "react"

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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { MenuItemWithCategory } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { maxCartLineQuantity } from "../commands"

type OrderItemFormProps = {
  item: MenuItemWithCategory
  onAddAction: (item: MenuItemWithCategory, quantity: number) => void
}

export function OrderItemForm({
  item,
  onAddAction,
}: OrderItemFormProps) {
  const t = useTranslations("Order")
  const format = useDashboardFormats()
  const [quantity, setQuantity] = useState("1")
  const [error, setError] = useState<string | null>(null)

  function setClampedQuantity(nextQuantity: number) {
    setQuantity(
      String(Math.min(maxCartLineQuantity, Math.max(1, nextQuantity)))
    )
    setError(null)
  }

  function handleDecrease() {
    const parsedQuantity = Number(quantity)
    const currentQuantity = Number.isInteger(parsedQuantity) ? parsedQuantity : 1

    setClampedQuantity(currentQuantity - 1)
  }

  function handleIncrease() {
    const parsedQuantity = Number(quantity)
    const currentQuantity = Number.isInteger(parsedQuantity) ? parsedQuantity : 1

    setClampedQuantity(currentQuantity + 1)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedQuantity = Number(quantity)

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > maxCartLineQuantity
    ) {
      setError(t("errors.quantity"))
      return
    }

    setError(null)
    onAddAction(item, parsedQuantity)
    setQuantity("1")
  }

  return (
    <Card className="flex h-full flex-col justify-between" size="sm">
      <form
        className="flex h-full flex-col justify-between gap-3"
        id={`order-form-${item.id}`}
        onSubmit={handleSubmit}
      >
        <CardHeader>
          <CardTitle className="line-clamp-1">{item.name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {item.menu_categories?.name ?? t("menuFallback")} · {format.currency(Number(item.price))}
          </CardDescription>
          <CardAction>
            <Badge variant={item.in_stock ? "secondary" : "outline"}>
              {item.in_stock ? t("inStock") : t("off")}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-0">
          <FieldGroup className="gap-3">
            <Field
              className="flex-col gap-1.5"
              data-invalid={Boolean(error)}
            >
              <FieldLabel
                className="sr-only"
                htmlFor={`quantity-${item.id}`}
              >
                {t("quantity")}
              </FieldLabel>
              <div className="flex min-h-10 items-center rounded-lg border border-input bg-background px-1">
                <Button
                  aria-label={t("decreaseItem", { item: item.name })}
                  className="shrink-0"
                  disabled={Number(quantity) <= 1}
                  onClick={handleDecrease}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Minus />
                </Button>
                <Input
                  aria-invalid={Boolean(error)}
                  aria-label={t("quantity")}
                  className="h-8 flex-1 border-0 bg-transparent text-center text-sm font-mono font-medium shadow-none focus-visible:ring-0"
                  id={`quantity-${item.id}`}
                  max={maxCartLineQuantity}
                  min="1"
                  onChange={(event) => {
                    setError(null)
                    setQuantity(event.target.value)
                  }}
                  type="number"
                  value={quantity}
                />
                <Button
                  aria-label={t("increaseItem", { item: item.name })}
                  className="shrink-0"
                  disabled={Number(quantity) >= maxCartLineQuantity}
                  onClick={handleIncrease}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Plus />
                </Button>
              </div>
              {error ? (
                <FieldError className="text-xs">{error}</FieldError>
              ) : null}
            </Field>
            <Button className="w-full" disabled={!item.in_stock} type="submit">
              <Plus data-icon="inline-start" />
              {t("addToCart")}
            </Button>
          </FieldGroup>
        </CardContent>
      </form>
    </Card>
  )
}
