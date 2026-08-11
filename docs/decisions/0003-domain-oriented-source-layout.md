# 0003 — Domain-oriented source layout

- Status: Accepted
- Date: 2026-07-28

## Context

The original project placed most operational components and mutations in shared
folders. Orders, inventory, membership, and subscription behavior would become
difficult to evolve independently as the SaaS grows.

## Decision

Use a domain-oriented modular monolith under `src/features/`:

```text
auth/            inventory/       orders/          subscriptions/
kitchen/         ledger/          queue/           vendors/
memberships/     menu/            reports/
```

Each feature owns its domain components, actions, policies, repositories, schemas,
and pure rules. App Router files remain thin. `src/components/ui/` contains reusable
shadcn primitives; cross-domain UI stays shared only when it has no feature owner.

## Consequences

- New business behavior goes into its feature rather than a general `lib/` dumping
  ground.
- Features may depend on shared infrastructure, but should not reach into another
  feature's internal components.
- Domain rules are extracted into pure modules so they can be unit tested.

