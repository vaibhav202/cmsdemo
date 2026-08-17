"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type VerticalTextTickerProps = {
  itemClassName?: string
  items: readonly string[]
  label: string
  variant?: "hero" | "inline"
}

export function VerticalTextTicker({
  itemClassName,
  items,
  label,
  variant = "inline",
}: VerticalTextTickerProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length < 2) return

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length)
    }, 2_800)

    return () => window.clearInterval(interval)
  }, [items.length])

  if (!items.length) return null

  const isHero = variant === "hero"
  const currentItem = items[index] ?? items[0]

  return (
    <span
      className={cn(
        isHero ? "block w-full max-w-full" : "inline-flex max-w-full min-w-0 items-center"
      )}
      data-public-ticker
    >
      <span className="sr-only">
        {label}: {items.join(", ")}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          isHero
            ? "relative block min-h-[2.2em] w-full max-w-full overflow-hidden sm:min-h-[2.1em]"
            : "relative inline-flex max-w-full overflow-hidden"
        )}
      >
        <span
          className={cn(
            "text-foreground animate-in slide-in-from-bottom-2 fade-in duration-500 motion-reduce:animate-none",
            isHero
              ? "block w-full max-w-full whitespace-normal text-balance text-[0.95em] font-semibold leading-[0.92]"
              : "flex h-7 items-center whitespace-nowrap font-medium",
            itemClassName
          )}
          key={`${index}-${currentItem}`}
        >
          {currentItem}
        </span>
      </span>
    </span>
  )
}
