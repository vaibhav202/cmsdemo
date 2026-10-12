"use client"

import { ClipboardList, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { OrderCard } from "@/components/dashboard/shared/order-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { useActiveOrders } from "./active-orders-context"

export function ActiveOrdersSheet() {
  const { activeOrders, isOpen, setIsOpen, vendorSlug } = useActiveOrders()
  const t = useTranslations("Order")
  const shell = useTranslations("Shell")
  const common = useTranslations("Common")
  const format = useDashboardFormats()

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetContent
        className="data-[side=right]:w-[92vw] flex flex-col gap-0 p-0 sm:max-w-md"
        data-active-orders-sheet
        side="right"
      >
        <SheetHeader className="border-b px-6 py-4 text-left">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />
            <SheetTitle className="text-lg font-semibold">
              {t("activeOrders")}
            </SheetTitle>
            <Badge className="ml-auto mr-6" variant="secondary">
              {format.integer(activeOrders.length)}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            {shell("activeOrdersDescription")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeOrders.length ? (
            <div className="flex flex-col gap-3">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  vendorSlug={vendorSlug}
                />
              ))}
            </div>
          ) : (
            <Empty className="my-8">
              <EmptyHeader>
                <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
        <SheetFooter className="border-t px-6 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] md:hidden">
          <SheetClose asChild>
            <Button className="min-h-11 w-full" type="button" variant="outline">
              <X data-icon="inline-start" />
              {common("actions.close")}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
