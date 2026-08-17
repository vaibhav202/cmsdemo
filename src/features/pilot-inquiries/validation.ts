export type PilotInquiryPayload = {
  businessName: string
  city: string
  consent: boolean
  email: string
  message: string
  name: string
  phone: string
  website: string
}

export const pilotInquiryFieldLimits = {
  businessName: 120,
  city: 80,
  email: 254,
  message: 1_000,
  name: 80,
  phone: 30,
  website: 120,
} as const

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function readPilotInquiryPayload(value: unknown): PilotInquiryPayload {
  const candidate = value && typeof value === "object" ? value : {}
  const body = candidate as Record<string, unknown>

  return {
    businessName: readText(body.businessName),
    city: readText(body.city),
    consent: body.consent === true,
    email: readText(body.email).toLowerCase(),
    message: readText(body.message),
    name: readText(body.name),
    phone: readText(body.phone),
    website: readText(body.website),
  }
}

export function isValidPilotInquiryPayload(payload: PilotInquiryPayload) {
  const withinLimit = (value: string, maximum: number) => value.length <= maximum

  return (
    payload.name.length >= 2 &&
    withinLimit(payload.name, pilotInquiryFieldLimits.name) &&
    payload.businessName.length >= 2 &&
    withinLimit(payload.businessName, pilotInquiryFieldLimits.businessName) &&
    payload.email.length >= 5 &&
    withinLimit(payload.email, pilotInquiryFieldLimits.email) &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email) &&
    withinLimit(payload.phone, pilotInquiryFieldLimits.phone) &&
    (!payload.phone || payload.phone.length >= 7) &&
    withinLimit(payload.city, pilotInquiryFieldLimits.city) &&
    (!payload.city || payload.city.length >= 2) &&
    withinLimit(payload.message, pilotInquiryFieldLimits.message) &&
    payload.consent
  )
}
