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

import { useDashboardFormats } from "../shared/format"
import { OrderItemForm } from "./order-item-form"

type CounterMenuProps = {
  menuItems: MenuItemWithCategory[]
  vendorId: string
  vendorSlug: string
}

export function CounterMenu({
  menuItems,
  vendorId,
  vendorSlug,
}: CounterMenuProps) {
  const locale = useLocale()
  const t = useTranslations("Order")
  const format = useDashboardFormats()
  const [query, setQuery] = useState("")
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

  return (
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
                vendorId={vendorId}
                vendorSlug={vendorSlug}
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
  )
}
