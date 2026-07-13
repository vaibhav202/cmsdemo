import { notFound } from "next/navigation"
import type { CSSProperties } from "react"

import { VendorShell } from "@/components/shell/vendor-shell"
import {
  getVendorAccentForeground,
  getHeadingFontValue,
  normalizeVendorAccent,
  platformBrand,
} from "@/lib/brand"
import { moduleLabels } from "@/lib/workspace-data"
import { requireWorkspaceSession } from "@/lib/workspace-auth"
import {
  getAllowedModules,
  getModuleHref,
} from "@/lib/permissions"
import { VendorNotFoundError } from "@/lib/supabase/errors"
import { getVendorBySlug } from "@/lib/supabase/queries"

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
  let vendor

  try {
    vendor = await getVendorBySlug(vendorSlug)
  } catch (error) {
    if (error instanceof VendorNotFoundError) {
      notFound()
    }

    throw error
  }

  const modules = getAllowedModules(session.user.role)
  const vendorInitial = vendor.name.slice(0, 1).toUpperCase()
  const initialClockIso = new Date().toISOString()
  const homeHref = `/app/${vendorSlug}`
  const navItems = modules.map((module) => ({
    href: getModuleHref(vendorSlug, module),
    label: moduleLabels[module].title.replace(" Dashboard", ""),
    module,
  }))
  const vendorAccent = normalizeVendorAccent(vendor.brand_color)
  const vendorAccentForeground = getVendorAccentForeground(vendorAccent)
  const workspaceStyle = {
    "--background":
      "color-mix(in srgb, var(--vendor-brand) 2.5%, var(--platform-background))",
    "--heading-font-family": getHeadingFontValue(vendor.heading_font),
    "--primary": vendorAccent,
    "--primary-foreground": vendorAccentForeground,
    "--ring": vendorAccent,
    "--sidebar-ring": vendorAccent,
    "--vendor-brand": vendorAccent,
    "--vendor-brand-foreground": vendorAccentForeground,
  } as CSSProperties

  return (
    <div className="min-h-svh bg-background" style={workspaceStyle}>
      <VendorShell
        homeHref={homeHref}
        initialClockIso={initialClockIso}
        navItems={navItems}
        platformName={platformBrand.name}
        user={{
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          status: session.user.status,
        }}
        vendor={{
          location: vendor.location,
          name: vendor.name,
        }}
        vendorInitial={vendorInitial}
      >
        {children}
      </VendorShell>
    </div>
  )
}
