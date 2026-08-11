import type { EntitlementSource } from "@/features/subscriptions/schemas"

export type EntitlementWindow = {
  startsAt: string | null
  endsAt: string | null
}

export type VendorEntitlementGrant = EntitlementWindow & {
  enabled: boolean
  featureKey: string
  limitValue: number | null
  source: EntitlementSource
}

export function isEntitlementActive(
  entitlement: EntitlementWindow,
  at = new Date()
) {
  const instant = at.getTime()
  const startsAt = entitlement.startsAt
    ? Date.parse(entitlement.startsAt)
    : Number.NEGATIVE_INFINITY
  const endsAt = entitlement.endsAt
    ? Date.parse(entitlement.endsAt)
    : Number.POSITIVE_INFINITY

  return instant >= startsAt && instant < endsAt
}

export function canUseEntitledFeature(
  entitlement: VendorEntitlementGrant | null | undefined,
  at = new Date()
) {
  return Boolean(
    entitlement?.enabled && isEntitlementActive(entitlement, at)
  )
}
