"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  LogOut,
  Menu,
  ShoppingCart,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { logoutAction } from "@/features/auth/actions"
import { canAccessModule } from "@/features/memberships/permissions"
import { useDashboardFormats } from "@/components/dashboard/shared/format"
import { AccessibilitySettings } from "@/components/accessibility/accessibility-control"
import { MediaImageUploadForm } from "@/components/media/media-image-upload-form"
import { LanguageMenu } from "@/components/shell/language-control"
import { LiveClock } from "@/components/shell/live-clock"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useActiveOrders } from "./active-orders-context"
import { useOrderCart } from "@/features/orders/components/order-cart-context"
import { navIcons } from "./nav-icons"
import type { ShellNavItem, ShellUser, ShellVendor } from "./shell-types"
import { ThemeModeControl } from "./theme-mode-control"

type MobileNavigationProps = {
  homeHref: string
  initialClockIso: string
  navItems: ShellNavItem[]
  platformName: string
  user: ShellUser
  vendor: ShellVendor
  vendorInitial: string
  vendorSlug: string
}

type MobileSheetProps = {
  children: ReactNode
  description: string
  title: string
  triggerIcon: LucideIcon
  triggerLabel: string
}

function MobileSheet({
  children,
  description,
  title,
  triggerIcon: TriggerIcon,
  triggerLabel,
}: MobileSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label={triggerLabel}
          className="size-11 rounded-full"
          size="icon"
          type="button"
          variant="ghost"
        >
          <TriggerIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="max-h-[82svh] rounded-t-xl pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
        side="bottom"
      >
        <SheetHeader className="pr-14 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4 pt-0.5 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

export function MobileNavigation({
  homeHref,
  initialClockIso,
  navItems,
  platformName,
  user,
  vendor,
  vendorInitial,
  vendorSlug,
}: MobileNavigationProps) {
  const pathname = usePathname()
  const t = useTranslations("Shell")
  const common = useTranslations("Common")
  const format = useDashboardFormats()
  const { activeOrdersCount, toggle: toggleActiveOrders } = useActiveOrders()
  const { isOpen: isCartOpen, openCart, totalQuantity } = useOrderCart()
  const activeItem =
    navItems.find((item) => pathname === item.href) ?? navItems[0]
  const hasOrderAccess = canAccessModule(user.role, "order")
  const isOrderModule = pathname === `/app/${vendorSlug}/order`

  const ActiveModuleIcon = activeItem ? navIcons[activeItem.module] : null

  return (
    <div className="mobile-navigation-fade pointer-events-none fixed inset-x-0 bottom-0 z-40 h-32 md:hidden">
      <div
        className="glass-surface pointer-events-auto absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] mx-auto flex h-14 max-w-md items-center gap-1 rounded-full border px-2"
        data-mobile-navigation
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <MobileSheet
            description={t("menuDescription")}
            title={t("menuTitle")}
            triggerIcon={Menu}
            triggerLabel={t("openMenu")}
          >
            <div className="flex flex-col gap-4">
              <SheetClose asChild>
                <Button
                  asChild
                  className="h-auto min-h-14 w-full justify-start px-3 py-3"
                  variant="outline"
                >
                  <Link href={homeHref}>
                    <Avatar size="lg">
                      <AvatarImage alt="" src={vendor.logoUrl ?? undefined} />
                      <AvatarFallback className="bg-vendor-brand text-vendor-brand-foreground">
                        {vendorInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm">
                        {platformName}
                      </span>
                      <span className="block truncate font-heading text-base font-semibold">
                        {vendor.name}
                      </span>
                      {vendor.location ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {vendor.location}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </Button>
              </SheetClose>

              <nav
                className="flex flex-col gap-2"
                aria-label={t("workspaceNavigation")}
              >
                {navItems.map((item) => {
                  const Icon = navIcons[item.module]
                  const active = pathname === item.href

                  return (
                    <SheetClose asChild key={item.module}>
                      <Button
                        asChild
                        className={cn(
                          "h-11 justify-start",
                          active && "font-semibold"
                        )}
                        variant={active ? "secondary" : "ghost"}
                      >
                        <Link
                          aria-current={active ? "page" : undefined}
                          href={item.href}
                        >
                          <Icon data-icon="inline-start" />
                          {item.label}
                        </Link>
                      </Button>
                    </SheetClose>
                  )
                })}
              </nav>
            </div>
          </MobileSheet>

          <div
            className="flex min-w-0 items-center gap-1.5"
            data-mobile-module-group
          >
            {ActiveModuleIcon ? (
              <span
                className="flex size-4 shrink-0 items-center text-primary"
                data-mobile-active-module-icon
              >
                <ActiveModuleIcon />
              </span>
            ) : null}
            <span
              className="truncate font-heading text-xs font-semibold"
              data-mobile-active-module
            >
              {activeItem?.label ?? t("workspace")}
            </span>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            aria-label={t("openActiveOrders")}
            className="relative size-11 rounded-full"
            data-mobile-active-orders
            onClick={toggleActiveOrders}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ClipboardList className="size-5" />
            {activeOrdersCount > 0 ? (
              <Badge
                className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]"
                variant="default"
              >
                {activeOrdersCount}
              </Badge>
            ) : null}
          </Button>

        {hasOrderAccess && !isOrderModule ? (
          <Button
            aria-expanded={isCartOpen}
            aria-label={t("openCart")}
            className="relative size-11 rounded-full"
            onClick={openCart}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ShoppingCart />
            <Badge
              className="absolute -top-1 -right-1 min-w-5 px-1 text-[10px]"
              variant={totalQuantity > 0 ? "default" : "secondary"}
            >
              {format.integer(totalQuantity)}
            </Badge>
          </Button>
        ) : null}

        <MobileSheet
          description={t("accountDescription")}
          title={t("accountTitle")}
          triggerIcon={UserRound}
          triggerLabel={t("openAccount")}
        >
          <div className="flex flex-col gap-3">
            <Card size="sm">
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription className="truncate">
                  {user.email}
                </CardDescription>
                <CardAction>
                  <Avatar size="lg">
                    <AvatarImage alt="" src={user.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-vendor-brand text-vendor-brand-foreground">
                      {user.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {common(`roles.${user.role}`)}
                  </Badge>
                  <Badge variant="outline">
                    {common(`membership.${user.status}`)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle>{common("accountImage.title")}</CardTitle>
                <CardDescription>
                  {common("accountImage.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardDescription>{t("workspace")}</CardDescription>
                <CardTitle>{vendor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {vendor.location ? (
                    <p className="text-sm text-muted-foreground">
                      {vendor.location}
                    </p>
                  ) : null}
                  <LiveClock initialIso={initialClockIso} />
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle>{common("theme.title")}</CardTitle>
                <CardDescription>
                  {common("theme.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeModeControl showLabels />
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle>{common("language")}</CardTitle>
                <CardDescription>
                  {common("chooseLanguageDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageMenu fullWidth />
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle>{common("accessibility.title")}</CardTitle>
                <CardDescription>
                  {common("accessibility.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessibilitySettings />
              </CardContent>
            </Card>

            <form action={logoutAction}>
              <Button className="min-h-12 w-full" type="submit" variant="outline">
                <LogOut data-icon="inline-start" />
                {common("actions.signOut")}
              </Button>
            </form>
          </div>
        </MobileSheet>
        </div>
      </div>
    </div>
  )
}
