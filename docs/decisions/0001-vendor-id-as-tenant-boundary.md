# 0001 — Vendor ID as the tenant boundary

- Status: Accepted
- Date: 2026-07-28

## Context

The product is a multi-vendor SaaS. Users may belong to one or more vendors, and
business records must never leak between vendors.

## Decision

`vendor_id` is the top-level tenant key for business data. Access is derived from
an active `vendor_members` row matching the authenticated Supabase user ID.
Application queries include the resolved vendor ID, while Postgres RLS independently
enforces the same boundary.

Vendor slugs are routing identifiers, not authorization evidence.

## Consequences

- New tenant-owned tables require a non-null `vendor_id`, an index beginning with
  `vendor_id` for tenant access paths, and tenant-aware RLS.
- Cross-tenant positive and negative cases are mandatory database tests.
- Changing the tenant key or introducing cross-vendor records requires a new ADR.

