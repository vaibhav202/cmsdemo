"use client"

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const themeOptions: Array<{
  icon: LucideIcon
  value: "light" | "dark" | "system"
}> = [
  { icon: Sun, value: "light" },
  { icon: Moon, value: "dark" },
  { icon: Monitor, value: "system" },
]

export function ThemeModeControl({
  showLabels = false,
}: {
  showLabels?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()
  const t = useTranslations("Common.theme")

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  if (!mounted) {
    return <div aria-hidden className={showLabels ? "h-9 w-full" : "h-8 w-24"} />
  }

  return (
    <ToggleGroup
      aria-label={t("controlLabel")}
      className={cn(showLabels && "grid w-full grid-cols-3")}
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
      spacing={0}
      type="single"
      value={theme ?? "system"}
      variant="outline"
    >
      {themeOptions.map(({ icon: Icon, value }) => {
        const label = t(value)

        return (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                aria-label={t("optionLabel", { theme: label })}
                className={cn(showLabels && "w-full")}
                value={value}
              >
                <Icon data-icon="inline-start" />
                {showLabels ? label : null}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              {t("optionLabel", { theme: label })}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}
