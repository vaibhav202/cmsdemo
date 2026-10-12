"use client"


import { usePathname } from "next/navigation"
import { ClipboardList, LogOut, ShoppingCart } from "lucide-react"
import { useTranslations } from "next-intl"

import { logoutAction } from "@/features/auth/actions"
import { canAccessModule } from "@/features/memberships/permissions"
import { AccessibilityMenu } from "@/components/accessibility/accessibility-control"
import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { MediaImageUploadForm } from "@/components/media/media-image-upload-form"
import { LanguageMenu } from "@/components/shell/language-control"
import { LiveClock } from "@/components/shell/live-clock"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useActiveOrders } from "./active-orders-context"
import { useOrderCart } from "@/features/orders/components/order-cart-context"
import type { ShellUser } from "./shell-types"
import { ThemeModeControl } from "./theme-mode-control"

type VendorTopbarProps = {
  initialClockIso: string
  user: ShellUser
  vendorSlug: string
}

export function VendorTopbar({
  initialClockIso,
  user,
  vendorSlug,
}: VendorTopbarProps) {
  const pathname = usePathname()
  const common = useTranslations("Common")
  const shell = useTranslations("Shell")
  const format = useDashboardFormats()
  const { activeOrdersCount, toggle } = useActiveOrders()
  const { isOpen: isCartOpen, openCart, totalQuantity } = useOrderCart()
  const hasOrderAccess = canAccessModule(user.role, "order")
  const isOrderModule = pathname === `/app/${vendorSlug}/order`

  return (
    <header className="glass-surface hidden h-18 shrink-0 border-b px-4 md:sticky md:top-0 md:z-30 md:block md:px-6">
      <div className="flex h-full flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                aria-label={common("accountImage.open")}
                className="size-10 rounded-full p-0"
                size="icon"
                variant="ghost"
              >
                <Avatar>
                  <AvatarImage
                    alt=""
                    src={user.avatarUrl ?? undefined}
                  />
                  <AvatarFallback className="bg-vendor-brand text-vendor-brand-foreground">
                    {user.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <PopoverHeader>
                <PopoverTitle>{user.name}</PopoverTitle>
                <PopoverDescription>{user.email}</PopoverDescription>
              </PopoverHeader>
              <MediaImageUploadForm
                currentUrl={user.avatarUrl}
                enabled={Boolean(user.memberId)}
                fallback={user.name.slice(0, 1).toUpperCase()}
                memberId={
                  user.memberId ??
                  (user.mediaMode === "demo" ? user.email : undefined)
                }
                mode={user.mediaMode}
                purpose="member-avatar"
                vendorSlug={vendorSlug}
              />
            </PopoverContent>
          </Popover>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            aria-label={shell("openActiveOrders")}
            className="h-9 gap-2 px-3"
            onClick={toggle}
            type="button"
            variant="outline"
          >
            <ClipboardList className="size-4 text-primary" />
            <span className="hidden lg:inline text-xs font-medium">
              {shell("activeOrders")}
            </span>
            <Badge
              className="h-5 px-1.5 text-[11px]"
              variant={activeOrdersCount > 0 ? "default" : "secondary"}
            >
              {format.integer(activeOrdersCount)}
            </Badge>
          </Button>

          {hasOrderAccess && !isOrderModule ? (
            <Button
              aria-expanded={isCartOpen}
              aria-label={shell("openCart")}
              className="relative size-9"
              onClick={openCart}
              size="icon"
              type="button"
              variant="outline"
            >
              <ShoppingCart data-icon="inline-start" />
              <Badge
                className="absolute -top-1 -right-1 min-w-5 px-1 text-[10px]"
                variant={totalQuantity > 0 ? "default" : "secondary"}
              >
                {format.integer(totalQuantity)}
              </Badge>
            </Button>
          ) : null}

          <div className="h-4 w-px bg-border mx-0.5" />

          <LanguageMenu compact />
          <ThemeModeControl />
          <AccessibilityMenu />
          <LiveClock initialIso={initialClockIso} />
          <Badge variant="secondary">{common(`roles.${user.role}`)}</Badge>
          <form action={logoutAction}>
            <Button size="icon" type="submit" variant="outline">
              <LogOut />
              <span className="sr-only">{common("actions.signOut")}</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
