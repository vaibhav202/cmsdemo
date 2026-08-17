"use client"

import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type RealtimeStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "unavailable"

export function OrderRealtimeSubscription({
  enabled,
  snapshotAt,
  vendorId,
}: {
  enabled: boolean
  snapshotAt: string
  vendorId: string
}) {
  const t = useTranslations("Order")
  const router = useRouter()
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
  const [status, setStatus] = useState<RealtimeStatus>(
    enabled && hasSupabaseConfig ? "connecting" : "unavailable"
  )
  const [stale, setStale] = useState(enabled && !hasSupabaseConfig)
  const lastSnapshotRef = useRef(snapshotAt)

  const refresh = useCallback(() => {
    setStale(true)
    router.refresh()
  }, [router])

  useEffect(() => {
    if (lastSnapshotRef.current === snapshotAt) return

    lastSnapshotRef.current = snapshotAt
    setStale(false)
  }, [snapshotAt])

  useEffect(() => {
    if (!enabled) return

    if (!hasSupabaseConfig) return

    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel(`vendor-orders:${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `vendor_id=eq.${vendorId}`,
          schema: "public",
          table: "orders",
        },
        () => refresh()
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setStatus("connected")
          return
        }

        if (
          subscriptionStatus === "CHANNEL_ERROR" ||
          subscriptionStatus === "TIMED_OUT" ||
          subscriptionStatus === "CLOSED"
        ) {
          setStatus("reconnecting")
          setStale(true)
        }
      })

    function handleConnectionChange() {
      setStatus("reconnecting")
      setStale(true)
      refresh()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        handleConnectionChange()
      }
    }

    window.addEventListener("online", handleConnectionChange)
    window.addEventListener("pageshow", handleConnectionChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("online", handleConnectionChange)
      window.removeEventListener("pageshow", handleConnectionChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      void supabase.removeChannel(channel)
    }
  }, [enabled, hasSupabaseConfig, refresh, vendorId])

  if (!enabled) return null

  const statusLabel = stale
    ? t("live.stale")
    : status === "connected"
      ? t("live.connected")
      : status === "connecting"
        ? t("live.connecting")
        : status === "reconnecting"
          ? t("live.reconnecting")
          : t("live.unavailable")

  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-center gap-2"
      data-order-realtime={status}
    >
      <Badge variant={stale ? "outline" : "secondary"}>
        {stale || status === "reconnecting" ? <WifiOff /> : <Wifi />}
        {statusLabel}
      </Badge>
      {stale || status === "reconnecting" || status === "unavailable" ? (
        <Button onClick={refresh} size="sm" type="button" variant="outline">
          <RefreshCw data-icon="inline-start" />
          {t("live.refresh")}
        </Button>
      ) : null}
    </div>
  )
}
