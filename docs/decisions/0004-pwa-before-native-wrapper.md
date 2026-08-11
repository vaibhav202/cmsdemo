# 0004 — PWA before a native wrapper

- Status: Accepted
- Date: 2026-07-28

## Context

Phone-first operation is essential, and an Android wrapper is planned. Building the
native wrapper before web workflows and resilience are proven would add release,
plugin, and debugging complexity too early.

## Decision

Deliver and validate the responsive web application and PWA behavior before adding
a Capacitor native wrapper. Critical cashier, kitchen, queue, inventory, locale,
accessibility, and intermittent-network behavior must work in supported mobile
browsers first.

## Consequences

- Mobile-first responsive behavior and Firefox E2E coverage are release gates now.
- Native-only capabilities are deferred until a product requirement needs them.
- The web application remains the source of truth when the wrapper is introduced.

