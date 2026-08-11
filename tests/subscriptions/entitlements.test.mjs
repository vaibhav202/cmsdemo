import assert from "node:assert/strict"
import test from "node:test"

import {
  canUseEntitledFeature,
  isEntitlementActive,
} from "../../src/features/subscriptions/entitlements.ts"
import { evaluateLimit } from "../../src/features/subscriptions/limits.ts"
import {
  normalizeProviderSubscription,
} from "../../src/features/subscriptions/provider-sync.ts"

test("entitlement windows use an inclusive start and exclusive end", () => {
  const window = {
    startsAt: "2026-07-01T00:00:00.000Z",
    endsAt: "2026-08-01T00:00:00.000Z",
  }

  assert.equal(
    isEntitlementActive(window, new Date("2026-07-01T00:00:00.000Z")),
    true
  )
  assert.equal(
    isEntitlementActive(window, new Date("2026-08-01T00:00:00.000Z")),
    false
  )
})

test("disabled grants never authorize feature use", () => {
  assert.equal(
    canUseEntitledFeature(
      {
        enabled: false,
        endsAt: null,
        featureKey: "orders.manage",
        limitValue: null,
        source: "manual",
        startsAt: null,
      },
      new Date("2026-07-28T00:00:00.000Z")
    ),
    false
  )
})

test("null limit is unlimited and finite limits preserve remaining capacity", () => {
  assert.deepEqual(evaluateLimit(1_000, null, 500), {
    allowed: true,
    limitValue: null,
    remaining: null,
    usage: 1_000,
  })
  assert.deepEqual(evaluateLimit(8, 10, 3), {
    allowed: false,
    limitValue: 10,
    remaining: 2,
    usage: 8,
  })
})

test("provider synchronization rejects unsupported statuses", () => {
  assert.throws(
    () =>
      normalizeProviderSubscription({
        providerCustomerId: "customer_1",
        providerProductId: "product_1",
        providerSubscriptionId: "subscription_1",
        status: "provider-specific-status",
      }),
    /Unsupported billing subscription status/
  )
})
