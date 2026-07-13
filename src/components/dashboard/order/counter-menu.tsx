"use client"

import { Search, X } from "lucide-react"
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
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLocaleLowerCase("en-IN")
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return menuItems

    return menuItems.filter((item) => {
      const category = item.menu_categories?.name ?? ""
      return `${item.name} ${category}`
        .toLocaleLowerCase("en-IN")
        .includes(normalizedQuery)
    })
  }, [menuItems, normalizedQuery])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create counter order</CardTitle>
        <CardDescription>
          Add one item quickly, confirm paid, and send it into the live queue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-(--card-spacing)">
        <Field>
          <FieldLabel className="sr-only" htmlFor="counter-menu-search">
            Search menu
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              autoComplete="off"
              id="counter-menu-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item or category"
              type="search"
              value={query}
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Clear menu search"
                  onClick={() => setQuery("")}
                  size="icon-xs"
                >
                  <X />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <FieldDescription>
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
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
              <EmptyTitle>No matching items</EmptyTitle>
              <EmptyDescription>
                Try another item name or menu category.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
