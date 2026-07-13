"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { MobileNavigation } from "./mobile-navigation"
import type { VendorShellProps } from "./shell-types"
import { VendorSidebar } from "./vendor-sidebar"
import { VendorTopbar } from "./vendor-topbar"

export function VendorShell({
  children,
  homeHref,
  initialClockIso,
  navItems,
  platformName,
  user,
  vendor,
  vendorInitial,
}: VendorShellProps) {
  return (
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
          vendorInitial={vendorInitial}
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
      />
    </SidebarProvider>
  )
}
