"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import { logoutAction } from "@/features/auth/actions"
import { AccessibilityMenu } from "@/components/accessibility/accessibility-control"
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
  const common = useTranslations("Common")

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
        <div className="flex items-center gap-3">
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
