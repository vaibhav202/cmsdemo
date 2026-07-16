"use client"

import { useFormatter } from "next-intl"
import { useEffect, useState } from "react"

type LiveClockProps = {
  initialIso: string
}

export function LiveClock({ initialIso }: LiveClockProps) {
  const [now, setNow] = useState(() => new Date(initialIso))
  const format = useFormatter()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col text-right sm:flex-row sm:items-baseline sm:gap-2">
      <span className="font-mono text-sm font-semibold uppercase tracking-normal">
        {format.dateTime(now, "clockTime")}
      </span>
      <span className="text-sm text-muted-foreground">
        {format.dateTime(now, "clockDate")}
      </span>
    </div>
  )
}
