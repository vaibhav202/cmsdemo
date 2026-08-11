import type { ReactNode } from "react"

import type {
  MembershipStatus,
  ModuleKey,
  VendorRole,
} from "@/features/memberships/permissions"
import type { MediaUploadMode } from "@/lib/media/config"

export type ShellVendor = {
  logoUrl: string | null
  name: string
  location: string | null
}

export type ShellUser = {
  avatarUrl: string | null
  name: string
  email: string
  mediaMode: MediaUploadMode
  memberId: string | null
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
  vendorSlug: string
}
