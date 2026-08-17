import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  isValidPilotInquiryPayload,
  readPilotInquiryPayload,
} from "@/features/pilot-inquiries/validation"

export const runtime = "nodejs"

const maximumBodyBytes = 16_384
const maximumRequestsPerWindow = 5
const rateLimitWindowMs = 60 * 60 * 1_000
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function response(status: number, body: Record<string, string>) {
  return NextResponse.json(body, { status })
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return true

  try {
    const originUrl = new URL(origin)
    const requestUrl = new URL(request.url)
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      .trim()
    const forwardedProtocol = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      .trim()
    const requestHost =
      forwardedHost ?? request.headers.get("host") ?? requestUrl.host
    const requestProtocol = forwardedProtocol
      ? `${forwardedProtocol}:`
      : requestUrl.protocol

    return (
      originUrl.host === requestHost &&
      originUrl.protocol === requestProtocol
    )
  } catch {
    return false
  }
}

function getRateLimitKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  ).slice(0, 120)
}

function isRateLimited(request: Request) {
  const now = Date.now()
  const key = getRateLimitKey(request)
  const current = rateLimits.get(key)

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + rateLimitWindowMs })
    return false
  }

  if (current.count >= maximumRequestsPerWindow) return true

  current.count += 1
  return false
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return response(403, { errorCode: "origin-invalid", status: "error" })
  }

  if (isRateLimited(request)) {
    return response(429, { errorCode: "rate-limited", status: "error" })
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (contentLength > maximumBodyBytes) {
    return response(413, { errorCode: "body-too-large", status: "error" })
  }

  let payload: ReturnType<typeof readPilotInquiryPayload>

  try {
    payload = readPilotInquiryPayload(await request.json())
  } catch {
    return response(400, { errorCode: "invalid-body", status: "error" })
  }

  // A filled honeypot is treated as a successful no-op so automated callers do
  // not learn whether the request was filtered.
  if (payload.website) {
    return response(201, { status: "ok" })
  }

  if (!isValidPilotInquiryPayload(payload)) {
    return response(400, { errorCode: "validation", status: "error" })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from("pilot_inquiries").insert({
      business_name: payload.businessName,
      city: payload.city || null,
      consent: payload.consent,
      email: payload.email,
      message: payload.message || null,
      name: payload.name,
      phone: payload.phone || null,
    })

    if (error) {
      console.error("Unable to save pilot inquiry", error)
      return response(503, { errorCode: "unavailable", status: "error" })
    }
  } catch (error) {
    console.error("Pilot inquiry service is unavailable", error)
    return response(503, { errorCode: "unavailable", status: "error" })
  }

  return response(201, { status: "ok" })
}
