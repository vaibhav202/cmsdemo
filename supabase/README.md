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

Storage:
- Bucket: `vendor-media`
- Public bucket for optimized image delivery.
- Authenticated upload/update policies are scoped by vendor folder and membership.

Realtime:
- `orders`, `order_items`, and `menu_items` were added to the `supabase_realtime` publication.
