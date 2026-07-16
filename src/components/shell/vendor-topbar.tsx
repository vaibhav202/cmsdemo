"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import { logoutAction } from "@/app/actions/auth"
import { LanguageMenu } from "@/components/shell/language-control"
import { LiveClock } from "@/components/shell/live-clock"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

import type { ShellUser } from "./shell-types"
import { ThemeModeControl } from "./theme-mode-control"

type VendorTopbarProps = {
  initialClockIso: string
  user: ShellUser
  vendorInitial: string
}

export function VendorTopbar({
  initialClockIso,
  user,
  vendorInitial,
}: VendorTopbarProps) {
  const common = useTranslations("Common")

  return (
    <header className="glass-surface hidden h-18 shrink-0 border-b px-4 md:sticky md:top-0 md:z-30 md:block md:px-6">
      <div className="flex h-full flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />
          <Avatar>
            <AvatarFallback className="bg-vendor-brand text-vendor-brand-foreground">
              {vendorInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageMenu compact />
          <ThemeModeControl />
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
