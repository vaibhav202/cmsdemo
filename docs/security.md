# Security Invariants

This file contains rules that must remain true as the platform evolves. Product
features, source organization, and billing providers may change; these invariants
may change only through an explicit security review and an ADR.

## Tenant isolation

- `vendor_id` is the tenant boundary for business data.
- A user receives vendor access only through an active `vendor_members` row tied
  to the authenticated Supabase user ID.
- Every business-data query and mutation must include the resolved vendor ID even
  when RLS applies the same filter.
- IDs, slugs, roles, plan codes, feature keys, and vendor IDs received from the
  browser are untrusted input. Authorization state is resolved on the server or
  inside Postgres.
- Cross-vendor reads and writes must be denied by RLS and covered by automated
  negative tests.

## Entitlements and permissions

- Business structure describes what the platform can do.
- Entitlements describe what a vendor has purchased or been granted.
- Membership roles and permissions describe what a user may do for that vendor.
- A protected operation requires both an active vendor entitlement and member
  permission. Neither condition implies the other.
- Subscription-provider events may change subscription and entitlement state;
  they must never assign vendor membership roles.

## Database enforcement

- RLS is enabled on every table in an exposed schema. `TO authenticated` is not
  authorization by itself; policies must include a tenant or ownership predicate.
- UPDATE policies include both `USING` and `WITH CHECK`, with a compatible SELECT
  policy.
- Authorization helpers that require elevated reads live outside exposed schemas,
  use a fixed empty `search_path`, have narrowly granted execution, and validate
  `auth.uid()`.
- User-facing operations use the authenticated publishable client and do not use a
  service-role or secret key. Service credentials are server-only and reserved for
  trusted platform jobs such as verified billing webhooks.
- Views exposed through the Data API use `security_invoker = true` or are not
  granted to public API roles.
- Multi-row business mutations that must succeed together are database-atomic and
  safe under concurrent requests.

## Authentication and sessions

- Supabase Auth is the production identity source. Preview credentials and cookies
  are never treated as production authorization.
- Authorization data never comes from user-editable `user_metadata`.
- Frontend route guards improve navigation only. Server validation and RLS enforce
  access.
- Registration and invitation flows are retry-safe and cannot create duplicate
  owner memberships or partially initialized tenants.

## Media and browser safety

- Browser code never receives Supabase secret/service-role keys.
- Uploaded images are decoded, bounded, normalized, metadata-stripped, and stored
  under tenant-scoped immutable object paths.
- Public vendor logos and private member avatars use separate Storage policies.
- Development demo media mode is device-local only and never authorizes or calls
  the production media endpoint; preview cookies cannot satisfy production auth.
- Translation catalogs are public code-owned ICU data. They contain no secrets,
  tenant data, HTML, translated URLs, or authorization decisions.
- Raw HTML injection, `dangerouslySetInnerHTML`, dynamic evaluation, and raw/rich
  translation rendering remain prohibited.

## Required security checks

- Unit tests cover permissions and domain rules.
- Integration tests cover server-side use cases and negative authorization paths.
- RLS tests cover tenant isolation and role permissions against a disposable
  database.
- Firefox E2E tests cover the critical cashier and kitchen/queue workflows.
- Translation, lint, type, build, and dependency checks remain release gates.
