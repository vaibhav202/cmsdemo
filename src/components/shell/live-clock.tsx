"use client"

import { useEffect, useState } from "react"

type LiveClockProps = {
  initialIso: string
}

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
})

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
  weekday: "short",
})

export function LiveClock({ initialIso }: LiveClockProps) {
  const [now, setNow] = useState(() => new Date(initialIso))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col text-right sm:flex-row sm:items-baseline sm:gap-2">
      <span className="font-mono text-sm font-semibold uppercase tracking-normal">
        {timeFormatter.format(now)}
      </span>
      <span className="text-sm text-muted-foreground">
        {dateFormatter.format(now)}
      </span>
    </div>
  )
}
