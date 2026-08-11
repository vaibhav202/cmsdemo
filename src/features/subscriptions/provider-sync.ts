import {
  isSubscriptionStatus,
  parseIsoTimestamp,
  type SubscriptionStatus,
} from "@/features/subscriptions/schemas"

export type ProviderSubscriptionSnapshot = {
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  currentPeriodStart: string | null
  providerCustomerId: string
  providerProductId: string
  providerSubscriptionId: string
  status: SubscriptionStatus
  trialEndsAt: string | null
}

export type ProviderSubscriptionInput = {
  cancelAtPeriodEnd?: unknown
  currentPeriodEnd?: unknown
  currentPeriodStart?: unknown
  providerCustomerId?: unknown
  providerProductId?: unknown
  providerSubscriptionId?: unknown
  status?: unknown
  trialEndsAt?: unknown
}

function parseProviderIdentifier(value: unknown, field: string) {
  if (typeof value !== "string" || value.length < 1 || value.length > 255) {
    throw new Error(`Invalid billing provider ${field}.`)
  }

  return value
}

export function normalizeProviderSubscription(
  input: ProviderSubscriptionInput
): ProviderSubscriptionSnapshot {
  if (
    typeof input.status !== "string" ||
    !isSubscriptionStatus(input.status)
  ) {
    throw new Error("Unsupported billing subscription status.")
  }

  return {
    cancelAtPeriodEnd: input.cancelAtPeriodEnd === true,
    currentPeriodEnd: parseIsoTimestamp(input.currentPeriodEnd),
    currentPeriodStart: parseIsoTimestamp(input.currentPeriodStart),
    providerCustomerId: parseProviderIdentifier(
      input.providerCustomerId,
      "customer ID"
    ),
    providerProductId: parseProviderIdentifier(
      input.providerProductId,
      "product ID"
    ),
    providerSubscriptionId: parseProviderIdentifier(
      input.providerSubscriptionId,
      "subscription ID"
    ),
    status: input.status,
    trialEndsAt: parseIsoTimestamp(input.trialEndsAt),
  }
}
