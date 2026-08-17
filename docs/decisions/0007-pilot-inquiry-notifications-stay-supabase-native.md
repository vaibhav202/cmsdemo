# ADR 0007: Pilot inquiry notifications stay Supabase-native

- Status: Accepted
- Date: 2026-08-17

## Context

The public pilot form must work from the web app now and from a future Capacitor
Android wrapper later. Inquiry data is already validated by the existing Next.js
API route and inserted into `public.pilot_inquiries`. Email credentials must never
be sent to either client.

Database Webhooks are asynchronous `pg_net` requests that run after a row change.
Email delivery can fail or be retried, so a direct "insert then send" implementation
without state would be vulnerable to duplicate notifications when the same webhook
is delivered more than once.

The initial pilot uses a personal SMTP account. That account is temporary and may
later be replaced by a transactional provider without changing the client or the
inquiry API.

## Decision

Keep the full notification path inside Supabase:

1. The web or Capacitor client submits to the existing inquiry API.
2. The API validates the request and inserts into `public.pilot_inquiries`.
3. An `AFTER INSERT` `pg_net` trigger queues the native Database Webhook payload.
   The trigger is version-controlled instead of relying on an untracked Dashboard
   setting, and it reads the shared header secret from Supabase Vault at runtime.
4. The `notify-pilot-inquiry` Edge Function authenticates the custom webhook header,
   validates the `INSERT` / `public` / `pilot_inquiries` payload, and uses the
   server-only SMTP secrets to deliver a plain-text email.
5. `public.pilot_inquiry_notifications` stores only trusted delivery state and is
   inaccessible to `anon` and `authenticated`.

The Edge Function claims work with an atomic compare-and-swap update keyed by the
inquiry ID and attempt number. `pending`, `sending`, `failed`, and stale `sending`
rows are retryable; `sent` rows are terminal. The email gets a deterministic
`Message-ID` as an additional duplicate-delivery aid.

SMTP uses native Deno TCP connections: STARTTLS for the usual port `587` and direct
TLS for port `465`. `SMTP_FROM` and `PILOT_INQUIRY_TO` remain server-side Edge
Function secrets. `Reply-To` is set to the validated inquiry email so the operator
can respond directly.

## Consequences

- The Capacitor app needs only the public inquiry endpoint and Supabase publishable
  client configuration; it never receives SMTP credentials, service-role keys, or
  the webhook secret.
- The inquiry is persisted before email work begins, so a temporary SMTP outage does
  not lose the lead. Failed deliveries can be retried by a webhook replay or an
  operational retry mechanism later.
- The notification path is at-least-once at the external SMTP boundary. A network
  failure after an SMTP server accepts a message cannot be distinguished perfectly
  from a rejected message; the claim state prevents normal duplicate webhook sends,
  but it cannot provide an exactly-once guarantee from SMTP itself.
- Operators should monitor `public.pilot_inquiry_notifications` and the `net` webhook
  response tables. SMTP provider/domain authentication (SPF, DKIM, and DMARC) remains
  a deliverability responsibility.
- Moving from personal SMTP to a transactional provider changes Edge Function
  secrets and, if needed, the SMTP adapter only; it does not change the client
  architecture or the database contract.
