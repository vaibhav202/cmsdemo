"use client"

import { Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"
import { toast } from "sonner"

import { setLocaleAction } from "@/app/actions/locale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  isAppLocale,
  localeOptions,
  type AppLocale,
} from "@/i18n/config"
import { cn } from "@/lib/utils"

type LanguageMenuProps = {
  compact?: boolean
  fullWidth?: boolean
}

export function LanguageMenu({
  compact = false,
  fullWidth = false,
}: LanguageMenuProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("Common")
  const [pending, startTransition] = useTransition()
  const current = localeOptions.find((option) => option.locale === locale)

  function changeLocale(nextLocale: string) {
    if (!isAppLocale(nextLocale) || nextLocale === locale || pending) return

    startTransition(async () => {
      const result = await setLocaleAction(nextLocale)

      if (result.status === "error") {
        toast.error(t("languageChangeFailed"))
        return
      }

      toast.success(t("languageChanged"))
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("chooseLanguage")}
          className={cn(fullWidth && "w-full justify-start")}
          disabled={pending}
          size={compact ? "icon" : "default"}
          type="button"
          variant="outline"
        >
          <Languages data-icon="inline-start" />
          {compact ? (
            <span className="sr-only">{t("chooseLanguage")}</span>
          ) : (
            current?.label ?? t("language")
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? "end" : "start"} className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("chooseLanguage")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            onValueChange={changeLocale}
            value={locale}
          >
            {localeOptions.map((option) => (
              <DropdownMenuRadioItem
                disabled={pending}
                key={option.locale}
                value={option.locale}
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
