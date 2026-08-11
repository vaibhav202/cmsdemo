export const subscriptionPlanCodes = [
  "basic",
  "pro",
  "enterprise",
] as const

export type SubscriptionPlanCode = (typeof subscriptionPlanCodes)[number]

export const subscriptionStatuses = [
  "incomplete",
  "trialing",
  "active",
  "past_due",
  "paused",
  "canceled",
  "expired",
] as const

export type SubscriptionStatus = (typeof subscriptionStatuses)[number]

export const entitlementSources = [
  "subscription",
  "manual",
  "promotion",
  "system",
] as const

export type EntitlementSource = (typeof entitlementSources)[number]

const featureKeyPattern = /^[a-z][a-z0-9_.]{2,79}$/

export function isSubscriptionPlanCode(
  value: string
): value is SubscriptionPlanCode {
  return subscriptionPlanCodes.includes(value as SubscriptionPlanCode)
}

export function isSubscriptionStatus(
  value: string
): value is SubscriptionStatus {
  return subscriptionStatuses.includes(value as SubscriptionStatus)
}

export function parseFeatureKey(value: unknown) {
  if (typeof value !== "string" || !featureKeyPattern.test(value)) {
    throw new Error("Invalid subscription feature key.")
  }

  return value
}

export function parseLimitValue(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }

  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error("Subscription limits must be non-negative safe integers.")
  }

  return value
}

export function parseIsoTimestamp(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error("Invalid subscription timestamp.")
  }

  return new Date(value).toISOString()
}
