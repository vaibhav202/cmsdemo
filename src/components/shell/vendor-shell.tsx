"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { OrderCartProvider } from "@/features/orders/components/order-cart-context"

import { ActiveOrdersProvider } from "./active-orders-context"
import { CartSheet } from "./cart-sheet"
import { ActiveOrdersSheet } from "./active-orders-sheet"
import { MobileNavigation } from "./mobile-navigation"
import type { VendorShellProps } from "./shell-types"
import { VendorSidebar } from "./vendor-sidebar"
import { VendorTopbar } from "./vendor-topbar"

export function VendorShell({
  children,
  homeHref,
  initialClockIso,
  navItems,
  orders = [],
  platformName,
  user,
  vendor,
  vendorInitial,
  vendorSlug,
}: VendorShellProps) {
  return (
    <OrderCartProvider>
      <ActiveOrdersProvider orders={orders} vendorSlug={vendorSlug}>
      <SidebarProvider>
        <VendorSidebar
          homeHref={homeHref}
          navItems={navItems}
          platformName={platformName}
          vendor={vendor}
          vendorInitial={vendorInitial}
        />

        <SidebarInset>
          <VendorTopbar
            initialClockIso={initialClockIso}
            user={user}
            vendorSlug={vendorSlug}
          />
          <main className="px-4 py-5 pb-28 lg:px-6 lg:py-6">{children}</main>
        </SidebarInset>

        <MobileNavigation
          homeHref={homeHref}
          initialClockIso={initialClockIso}
          navItems={navItems}
          platformName={platformName}
          user={user}
          vendor={vendor}
          vendorInitial={vendorInitial}
          vendorSlug={vendorSlug}
        />

        <ActiveOrdersSheet />
        <CartSheet vendorSlug={vendorSlug} />
      </SidebarProvider>
      </ActiveOrdersProvider>
    </OrderCartProvider>
  )
}
