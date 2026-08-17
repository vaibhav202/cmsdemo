# ADR 0006: Order Realtime waits for production Auth

- Status: Accepted
- Date: 2026-08-11

## Context

Order, Kitchen, and Queue need to refresh when another staff device creates or
progresses a ticket. Supabase Postgres Changes can provide that signal, but the
application currently uses a temporary presentation cookie rather than a
Supabase Auth session. The cookie is not a JWT and must not be treated as a
Realtime authorization credential.

The cart checkout migration and its RLS policies also still require review and
application against the actual Supabase project. Enabling a browser subscription
before those boundaries are verified could expose demo or tenant rows, or could
show a false "live" state when the browser is only connected as `anon`.

## Decision

Implement the subscription as a feature-owned Client Component, but require all
of the following before it renders:

- `SUPABASE_AUTH_ENABLED=true` on the server;
- `NEXT_PUBLIC_ORDER_REALTIME_ENABLED=true`; and
- non-fixture execution.

The component subscribes only to `public.orders` with a filter built from the
server-resolved `vendor.id`. The filter narrows events; it is not an
authorization boundary. The server remains responsible for membership checks,
queries, and RLS.

On an order event, the browser calls `router.refresh()` so the existing Server
Component data loader remains the source of truth, including nested order items.
Connection, reconnecting, unavailable, and stale snapshot states are visible,
with a manual refresh action. The stale state is cleared only after a new server
snapshot arrives.

Postgres Changes is the pilot implementation because it is simpler to operate.
A later scale review may replace it with private Broadcast topics and explicit
Realtime authorization policies.

## Consequences

- Current fixture E2E tests and demo-cookie work do not open a Supabase channel.
- Production Auth, tenant RLS, the cart migration, and Realtime publication
  settings must be verified before enabling the flags on Vercel.
- Order mutations remain usable without Realtime; the live indicator is not
  presented when the feature is disabled.
- The browser never receives a service-role key or a client-trusted vendor ID
  for authorization.
