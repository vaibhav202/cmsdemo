"use client"

import { Plus } from "lucide-react"
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
    <Card size="sm">
      <form
        className="flex flex-col gap-(--card-spacing)"
        id={`order-form-${item.id}`}
        onSubmit={handleSubmit}
      >
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription>
            {item.menu_categories?.name ?? t("menuFallback")} · {format.currency(Number(item.price))}
          </CardDescription>
          <CardAction>
            <Badge variant={item.in_stock ? "secondary" : "outline"}>
              {item.in_stock ? t("inStock") : t("off")}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor={`quantity-${item.id}`}>
                {t("quantity")}
              </FieldLabel>
              <Input
                aria-invalid={Boolean(error)}
                id={`quantity-${item.id}`}
                max={maxCartLineQuantity}
                min="1"
                onChange={(event) => setQuantity(event.target.value)}
                type="number"
                value={quantity}
              />
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>
            <Button disabled={!item.in_stock} size="sm" type="submit">
              <Plus data-icon="inline-start" />
              {t("addToCart")}
            </Button>
          </FieldGroup>
        </CardContent>
      </form>
    </Card>
  )
}
