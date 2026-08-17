"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { useDashboardFormats } from "@/components/dashboard/shared/format"

export function ElapsedTime({ createdAt }: { createdAt: string }) {
  const t = useTranslations("Order")
  const format = useDashboardFormats()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setNow(Date.now()), 0)
    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [])

  const createdTimestamp = Date.parse(createdAt)

  if (now === null || Number.isNaN(createdTimestamp)) {
    return <span className="text-xs text-muted-foreground">{t("elapsed.justNow")}</span>
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - createdTimestamp) / 60_000)
  )
  const label =
    elapsedMinutes < 1
      ? t("elapsed.justNow")
      : elapsedMinutes < 60
        ? t("elapsed.minutes", { value: format.integer(elapsedMinutes) })
        : t("elapsed.hours", {
            hours: format.integer(Math.floor(elapsedMinutes / 60)),
            minutes: format.integer(elapsedMinutes % 60),
          })

  return (
    <time
      className="text-xs text-muted-foreground"
      dateTime={createdAt}
      title={createdAt}
    >
      {label}
    </time>
  )
}
