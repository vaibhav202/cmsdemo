"use client"

import { usePathname } from "next/navigation"
import { ShoppingCart, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { OrderCart } from "@/features/orders/components/order-cart"
import { useOrderCart } from "@/features/orders/components/order-cart-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function CartSheet({ vendorSlug }: { vendorSlug: string }) {
  const pathname = usePathname()
  const shell = useTranslations("Shell")
  const common = useTranslations("Common")
  const format = useDashboardFormats()
  const { isOpen, setIsOpen, totalQuantity } = useOrderCart()
  const isOrderModule = pathname === `/app/${vendorSlug}/order`

  useEffect(() => {
    if (isOrderModule && isOpen) setIsOpen(false)
  }, [isOpen, isOrderModule, setIsOpen])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetContent
        className="data-[side=right]:w-[92vw] gap-0 p-0 sm:max-w-md"
        data-cart-sheet
        side="right"
      >
        <SheetHeader className="border-b px-6 py-4 text-left">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" />
            <SheetTitle>{shell("cart")}</SheetTitle>
            <Badge className="ml-auto mr-6" variant="secondary">
              {format.integer(totalQuantity)}
            </Badge>
          </div>
          <SheetDescription>{shell("cartDescription")}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <OrderCart embedded showHeader={false} vendorSlug={vendorSlug} />
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
