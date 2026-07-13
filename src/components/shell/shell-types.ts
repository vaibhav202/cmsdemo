import type { ReactNode } from "react"

import type { MembershipStatus, ModuleKey, VendorRole } from "@/lib/permissions"

export type ShellVendor = {
  name: string
  location: string | null
}

export type ShellUser = {
  name: string
  email: string
  role: VendorRole
  status: MembershipStatus
}

export type ShellNavItem = {
  href: string
  label: string
  module: ModuleKey
}

export type VendorShellProps = {
  children: ReactNode
  homeHref: string
  initialClockIso: string
  navItems: ShellNavItem[]
  platformName: string
  user: ShellUser
  vendor: ShellVendor
  vendorInitial: string
}
