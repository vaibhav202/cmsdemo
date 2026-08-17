# Supabase Project Notes

Project:
- Name: CMS Platform
- Ref: `bayrnypobftotxnuysom`
- Region: `ap-south-1`

Remote schema work applied through Supabase MCP:
- Initial platform schema and seed workspace.
- Advisor cleanup for security and indexes.
- Interactive order/menu operations for the presentation workspace.
- Vendor identity settings: `brand_color` and `heading_font`.
- Cart checkout, pilot inquiry, private counter-table RLS, pilot inquiry notification, and pg_net webhook migrations applied on 2026-08-16 after remote schema/RLS review.
- `notify-pilot-inquiry` is deployed and active. It uses Supabase Vault for the webhook secret and server-side Edge Function secrets for SMTP delivery.

Current sample workspace:
- Name: City Canteen
- Slug: `city-canteen`
- Location: Pune, Maharashtra

Important:
- All tenant-owned public tables have RLS enabled.
- Security advisors were clean after the latest migration.
- The current workspace uses temporary public-preview policies so the app can be presented before Supabase Auth users are created.
- Before onboarding a real vendor, replace temporary workspace cookies with Supabase Auth and remove or disable public-preview write policies.

Repository migrations:
- `20260713202753_inventory_preview_write_policies.sql` adds temporary preview
  insert policies and atomic `SECURITY INVOKER` functions for ingredient creation
  and stock movement recording.
- The migration was applied to the remote CMS Platform project on 2026-07-14.
  Replace its demo-vendor policies during the Auth/RLS phase.
- `20260816135052_cart_checkout_order_creation.sql` adds atomic cart checkout,
  idempotency, payment metadata, and demo/authenticated RPC boundaries.
- `20260816134803_public_pilot_inquiries.sql` adds the anonymous inquiry table with
  RLS and INSERT-only Data API access.
- `20260816135334_vendor_order_counter_rls.sql` enables defense-in-depth RLS on the
  private token counter; it intentionally has no direct role policies.
- `20260816230931_pilot_inquiry_notifications.sql` adds service-role-only notification
  state with retry status and idempotent attempt tracking.
- `20260816234122_pilot_inquiry_webhook.sql` adds the private asynchronous `pg_net`
  trigger that posts inserts to the notification Edge Function using a Vault secret.
- `20260816234718_move_pg_net_extension.sql` relocates pg_net into the non-exposed
  `extensions` schema and recreates the trigger safely.

Tables created:
- `vendors`
- `profiles`
- `vendor_members`
- `menu_categories`
- `menu_items`
- `orders`
- `order_items`
- `stock_items`
- `stock_log`
- `ledger_entries`
- `media_assets`
- `audit_logs`
- `pilot_inquiries`
- `pilot_inquiry_notifications` (service-role-only delivery state)

Storage:
- Bucket: `vendor-media`
- Public bucket for optimized image delivery.
- Authenticated upload/update policies are scoped by vendor folder and membership.

Realtime:
- `orders`, `order_items`, and `menu_items` were added to the `supabase_realtime` publication.
