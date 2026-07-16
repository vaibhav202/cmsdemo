"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { navIcons } from "./nav-icons"
import type { ShellNavItem, ShellVendor } from "./shell-types"

type VendorSidebarProps = {
  homeHref: string
  navItems: ShellNavItem[]
  platformName: string
  vendor: ShellVendor
  vendorInitial: string
}

export function VendorSidebar({
  homeHref,
  navItems,
  platformName,
  vendor,
  vendorInitial,
}: VendorSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations("Shell")

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-18 justify-center border-b p-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-[3.75rem] py-1"
              size="lg"
              tooltip={`${platformName} ${vendor.name}`}
            >
              <Link href={homeHref}>
                <Avatar className="size-10 group-data-[collapsible=icon]:size-8">
                  <AvatarFallback className="bg-vendor-brand text-vendor-brand-foreground">
                    {vendorInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate leading-4">{platformName}</span>
                  <span className="block truncate font-heading font-semibold leading-5">
                    {vendor.name}
                  </span>
                  {vendor.location ? (
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      {vendor.location}
                    </span>
                  ) : null}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = navIcons[item.module]
                const active = pathname === item.href

                return (
                  <SidebarMenuItem key={item.module}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link
                        aria-current={active ? "page" : undefined}
                        href={item.href}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
