"use client"

import { Search, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

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
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { MenuItemWithCategory } from "@/lib/supabase/types"

import { useDashboardFormats } from "@/components/dashboard/shared/format"
import {
  changeCartLineQuantity,
  mergeCartLine,
  removeCartLine,
} from "../commands"
import { OrderCart, type OrderCartLine } from "./order-cart"
import { OrderItemForm } from "./order-item-form"

type CounterMenuProps = {
  menuItems: MenuItemWithCategory[]
  vendorSlug: string
}

export function CounterMenu({ menuItems, vendorSlug }: CounterMenuProps) {
  const locale = useLocale()
  const t = useTranslations("Order")
  const format = useDashboardFormats()
  const [query, setQuery] = useState("")
  const [cartLines, setCartLines] = useState<OrderCartLine[]>([])
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return menuItems

    return menuItems.filter((item) => {
      const category = item.menu_categories?.name ?? ""
      return `${item.name} ${category}`
        .toLocaleLowerCase(locale)
        .includes(normalizedQuery)
    })
  }, [locale, menuItems, normalizedQuery])

  function addToCart(item: MenuItemWithCategory, quantity: number) {
    setCartLines((currentLines) =>
      mergeCartLine(currentLines, { item, quantity }, (line) => line.item.id)
    )
  }

  function changeQuantity(menuItemId: string, quantity: number) {
    setCartLines((currentLines) =>
      changeCartLineQuantity(currentLines, menuItemId, quantity, (line) =>
        line.item.id
      )
    )
  }

  function removeFromCart(menuItemId: string) {
    setCartLines((currentLines) =>
      removeCartLine(currentLines, menuItemId, (line) => line.item.id)
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
          <CardDescription>{t("createDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-(--card-spacing)">
          <Field>
            <FieldLabel className="sr-only" htmlFor="counter-menu-search">
              {t("searchLabel")}
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                autoComplete="off"
                id="counter-menu-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                type="search"
                value={query}
              />
              {query ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={t("searchLabel")}
                    onClick={() => setQuery("")}
                    size="icon-xs"
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
            <FieldDescription>
              {t("resultCount", {
                count: filteredItems.length,
                formattedCount: format.integer(filteredItems.length),
              })}
            </FieldDescription>
          </Field>

          {filteredItems.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <OrderItemForm
                  item={item}
                  key={item.id}
                  onAddAction={addToCart}
                />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("noMatchTitle")}</EmptyTitle>
                <EmptyDescription>{t("noMatchDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <OrderCart
        lines={cartLines}
        onClearAction={() => setCartLines([])}
        onQuantityChangeAction={changeQuantity}
        onRemoveAction={removeFromCart}
        vendorSlug={vendorSlug}
      />
    </div>
  )
}
