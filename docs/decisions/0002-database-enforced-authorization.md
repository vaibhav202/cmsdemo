# 0002 — Database-enforced authorization

- Status: Accepted
- Date: 2026-07-28

## Context

Route guards and Server Actions can improve UX, but clients may call the Supabase
Data API directly. Subscription access and employee authority are also different
questions.

## Decision

Postgres RLS is the final authorization boundary for exposed data. Application code
also validates the actor and scopes every operation by vendor.

Authorization combines two independent checks:

1. The vendor has an active entitlement for the capability.
2. The active vendor member has permission to perform the operation.

Entitlements are derived from subscriptions or explicit grants. Membership roles
are not derived from billing-provider events.

## Consequences

- `TO authenticated` without a row predicate is prohibited.
- Browser-supplied vendor IDs, roles, and plan data are never trusted.
- Security-sensitive policy changes require RLS regression tests.
- Service-role access is restricted to trusted server-side platform operations.

