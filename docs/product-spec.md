# CMS Platform Product Specification

This document is the canonical MVP scope and role-permission reference for humans
and coding agents. It replaces the former agent workflow pack's separate MVP and
permission files.

## Product Goal

One real Pune vendor must be able to run menu, order, kitchen, and queue operations
safely from a phone without cross-vendor data leakage.

Positioning:

- Subscription-only B2B operations software.
- No ads, hidden monetization, marketplace settlement, lending, or credit scoring.
- Phone-first web/PWA validation before Capacitor or Play Store publication.

## Tenant And Membership Model

- `vendors.id` / `vendor_id` is the tenant boundary for business data.
- `vendor_members` maps an authenticated user to a vendor, role, and status.
- A route slug is navigation context, not an authorization boundary.
- Protected access requires an active membership and the required role.
- Server validation and Supabase RLS are mandatory; client checks are UX only.

Membership statuses:

- `active`: may use permitted features.
- `invited`: no protected access until activated.
- `disabled`: no protected access.

Roles:

- `owner`: vendor ownership, members, settings, operations, and finance.
- `admin`: broad vendor administration except ownership transfer.
- `manager`: day-to-day operations with limited sensitive settings and finance.
- `cashier`: order creation and permitted counter-payment actions.
- `kitchen`: kitchen queue and permitted status progression.
- `accountant`: ledger, expenses, and reports without operational administration.

## MVP Scope

Must include:

- Next.js App Router foundation ready for Vercel.
- Supabase Auth, PostgreSQL, RLS, Storage, and Realtime.
- Vendors, profiles, memberships, and active/disabled access handling.
- Order, Kitchen, Queue, and Control dashboards.
- Menu categories/items, availability, order creation, payment confirmation, order
  progression, and live queue display.
- Counter menu search plus a basic ingredient register with opening stock,
  reorder levels, stock-in, stock-out, and movement history.
- Vendor logo, menu image, and staff avatar uploads normalized server-side.
- Terms, Privacy, support contact, vendor settings, and sensitive-action audit logs.
- Cross-vendor RLS tests, role tests, mobile workflow tests, and order lifecycle tests.

Include if time allows:

- Basic export, expenses, daily sales summary, staff invites, onboarding checklist,
  and realtime reconnect/stale-state feedback.

Defer until after pilot:

- Full ledger and profit/loss reporting.
- Menu recipes, automatic ingredient deduction, and stocking suggestions.
- Customer accounts or phone OTP.
- Capacitor, Play Store release, and automated subscription billing.
- Multi-branch support, advanced analytics, and public marketplace behavior.

Out of scope without explicit approval:

- Ads or data resale.
- Vendor payment settlement, wallets, lending, or credit scoring.
- Service-role keys in browser code.
- Cross-vendor reporting inside vendor dashboards.

## Dashboard Access

| Dashboard | Owner | Admin | Manager | Cashier | Kitchen | Accountant |
| --- | --- | --- | --- | --- | --- | --- |
| Order | Allow | Allow | Allow | Allow | Deny | Deny |
| Kitchen | Allow | Allow | Allow | Deny | Allow | Deny |
| Queue | Allow | Allow | Allow | Allow | Allow | Deny |
| Control | Allow | Allow | Limited | Deny | Deny | Deny |
| Inventory | Allow | Allow | Allow | Deny | Limited | Deny |
| Ledger | Allow | Allow | Deny | Deny | Deny | Allow |
| Reports | Allow | Allow | Limited | Deny | Deny | Allow |

## Capability Access

| Capability | Owner | Admin | Manager | Cashier | Kitchen | Accountant |
| --- | --- | --- | --- | --- | --- | --- |
| View operational menu | Allow | Allow | Allow | Allow | Allow | Deny |
| Manage menu items | Allow | Allow | Allow | Deny | Deny | Deny |
| Toggle availability | Allow | Allow | Allow | Deny | Limited | Deny |
| Create orders | Allow | Allow | Allow | Allow | Deny | Deny |
| Confirm counter payment | Allow | Allow | Allow | Allow | Deny | Deny |
| Progress kitchen status | Allow | Allow | Allow | Deny | Allow | Deny |
| Cancel or refund | Allow | Allow | Allow | Configurable | Deny | Deny |
| View stock | Allow | Allow | Allow | Deny | Limited | Deny |
| Manage stock items | Allow | Allow | Allow | Deny | Deny | Deny |
| Record stock movement | Allow | Allow | Allow | Deny | Configurable | Deny |
| View ledger and expenses | Allow | Allow | Deny | Deny | Deny | Allow |
| Create finance entries | Allow | Allow | Deny | Deny | Deny | Allow |
| View members | Allow | Allow | Limited | Deny | Deny | Deny |
| Invite members | Allow | Allow | Deny | Deny | Deny | Deny |
| Change member role | Allow | Non-owner only | Deny | Deny | Deny | Deny |
| Disable members | Allow | Non-owner only | Deny | Deny | Deny | Deny |
| Edit vendor profile | Allow | Allow | Limited | Deny | Deny | Deny |

`Limited` and `Configurable` are deny-by-default until a concrete policy is approved
and tested.

## RLS And Security Contract

- Enable RLS on every tenant-owned table exposed through the Data API.
- Base access on an active membership matching `row.vendor_id` and `auth.uid()`.
- Write policies also verify role and use both `USING` and `WITH CHECK` where needed.
- Invited, disabled, unauthenticated, and cross-vendor access must fail.
- Do not authorize with user-editable metadata.
- Do not add platform-admin data access paths without explicit approval, logging,
  and documented support need.
- Keep public/customer flows separate from protected staff policies.

## Release Gates

Security gate:

- Supabase Auth memberships replace presentation cookies.
- Cross-vendor reads and writes fail in automated/manual tests.
- Disabled membership and role restrictions are verified.

Operations gate:

- Menu, orders, kitchen progression, queue updates, and mobile layout work end to end.
- Realtime reconnect behavior is acceptable.

Trust gate:

- Terms, Privacy, support, admin-access policy, deletion, and export processes exist.

Pilot gate:

- One test vendor completes onboarding and one complete order lifecycle.
- Known limitations and support expectations are documented.

## Open Decisions

- Whether managers may view limited finance summaries.
- Whether cashiers may cancel or refund orders.
- Whether kitchen members may record stock movements.
- Whether public queue displays require authentication.
- Whether future customer ordering uses no login, OTP, or another mechanism.
