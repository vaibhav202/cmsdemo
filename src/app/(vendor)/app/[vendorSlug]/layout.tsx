import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import type { CSSProperties } from "react"

import { VendorShell } from "@/components/shell/vendor-shell"
import {
  getVendorAccentForeground,
  normalizeVendorAccent,
  platformBrand,
} from "@/features/vendors/brand"
import { getLocaleHeadingFont } from "@/lib/fonts"
import { getCurrentMemberMedia } from "@/lib/media/assets"
import { requireWorkspaceSession } from "@/features/auth/demo-session"
import {
  getAllowedModules,
  getModuleHref,
} from "@/features/memberships/permissions"
import { VendorNotFoundError } from "@/lib/supabase/errors"
import { getVendorDashboardData } from "@/features/vendors/data"

type VendorLayoutProps = {
  children: React.ReactNode
  params: Promise<{ vendorSlug: string }>
}

export default async function VendorLayout({
  children,
  params,
}: VendorLayoutProps) {
  const { vendorSlug } = await params
  const session = await requireWorkspaceSession()
  const [locale, moduleTranslations] = await Promise.all([
    getLocale(),
    getTranslations("Module"),
  ])
  let dashboardData

  try {
    dashboardData = await getVendorDashboardData(vendorSlug)
  } catch (error) {
    if (error instanceof VendorNotFoundError) {
      notFound()
    }

    throw error
  }

  const vendor = dashboardData.vendor
  const modules = getAllowedModules(session.user.role)
  const vendorInitial = vendor.name.slice(0, 1).toUpperCase()
  const initialClockIso = new Date().toISOString()
  const homeHref = `/app/${vendorSlug}`
  const navItems = modules.map((module) => ({
    href: getModuleHref(vendorSlug, module),
    label: moduleTranslations(`${module}.shortTitle` as "order.shortTitle"),
    module,
  }))
  const vendorAccent = normalizeVendorAccent(vendor.brand_color)
  const vendorAccentForeground = getVendorAccentForeground(vendorAccent)
  const currentMemberMedia = await getCurrentMemberMedia(vendor.id)
  const workspaceStyle = {
    "--background":
      "color-mix(in srgb, var(--vendor-brand) 2.5%, var(--platform-background))",
    "--heading-font-family": getLocaleHeadingFont(vendor.heading_font, locale),
    "--primary": vendorAccent,
    "--primary-foreground": vendorAccentForeground,
    "--ring": vendorAccent,
    "--sidebar-ring": vendorAccent,
    "--vendor-brand": vendorAccent,
    "--vendor-brand-foreground": vendorAccentForeground,
  } as CSSProperties

  return (
    <div
      className="min-h-svh bg-background"
      data-vendor-workspace
      style={workspaceStyle}
    >
      <VendorShell
        homeHref={homeHref}
        initialClockIso={initialClockIso}
        navItems={navItems}
        orders={dashboardData.orders}
        platformName={platformBrand.name}
        user={{
          avatarUrl: currentMemberMedia?.avatarUrl ?? null,
          email: session.user.email,
          mediaMode:
            process.env.NODE_ENV === "production" ? "production" : "demo",
          memberId: currentMemberMedia?.memberId ?? null,
          name: session.user.name,
          role: session.user.role,
          status: session.user.status,
        }}
        vendor={{
          logoUrl: vendor.logo_url,
          location: vendor.location,
          name: vendor.name,
        }}
        vendorInitial={vendorInitial}
        vendorSlug={vendorSlug}
      >
        {children}
      </VendorShell>
    </div>
  )
}
