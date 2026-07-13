"use client"

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
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
  label: string
  value: "light" | "dark" | "system"
}> = [
  { icon: Sun, label: "Light", value: "light" },
  { icon: Moon, label: "Dark", value: "dark" },
  { icon: Monitor, label: "System", value: "system" },
]

export function ThemeModeControl({
  showLabels = false,
}: {
  showLabels?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  if (!mounted) {
    return <div aria-hidden className={showLabels ? "h-9 w-full" : "h-8 w-24"} />
  }

  return (
    <ToggleGroup
      aria-label="Appearance theme"
      className={cn(showLabels && "grid w-full grid-cols-3")}
      onValueChange={(value) => {
        if (value) setTheme(value)
      }}
      spacing={0}
      type="single"
      value={theme ?? "system"}
      variant="outline"
    >
      {themeOptions.map(({ icon: Icon, label, value }) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              aria-label={`${label} theme`}
              className={cn(showLabels && "w-full")}
              value={value}
            >
              <Icon data-icon="inline-start" />
              {showLabels ? label : null}
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{label} theme</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}
