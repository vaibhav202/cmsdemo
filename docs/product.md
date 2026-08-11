# CMS Platform Product

This document is the canonical MVP scope and role-permission reference for humans
and coding agents. It replaces the former agent workflow pack's separate MVP and
permission files.

## Product Goal

One real Pune vendor must be able to run menu, order, kitchen, and queue operations
safely from a phone without cross-vendor data leakage, with a Marathi-first interface
that does not require staff to operate the product in English.

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

Subscription and authorization separation:

- Features define stable platform capabilities and modules.
- Plans group commercial feature templates and limits.
- Vendor entitlements represent the features actually granted to one vendor.
- Membership roles determine which authenticated users may use those entitled
  features.
- An entitlement never creates membership or elevates a member's role.
- A permitted role cannot use a module that is not entitled once subscription
  enforcement is enabled.
- Basic, Pro, and Enterprise are approved plan names. Their feature matrix, pricing,
  trial duration, and registration default remain product decisions and must not be
  inferred in code.

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
- Device-local text size, text weight, Color-safe, and High contrast accessibility
  preferences available before and after authentication.
- Cross-vendor RLS tests, role tests, mobile workflow tests, and order lifecycle tests.

## Language And Localization Contract

- The staff interface supports Marathi (`mr-IN`), English (`en-IN`), Hindi (`hi-IN`),
  and Gujarati (`gu-IN`). Marathi is the product default and the first-class launch
  language for the Maharashtra pilot.
- Routes remain locale-neutral. Locale-prefixed URLs are not part of the product
  contract because staff may share operational links across language preferences.
- Locale resolution order is the validated `cms_platform_locale` cookie, the browser
  `Accept-Language` header, then Marathi. The cookie is device-local for the MVP;
  authenticated profile synchronization may be added later.
- Language selection is available through a compact popup before sign-in, in the
  desktop top bar, and in the mobile account sheet; it must not require a dedicated
  full-height overlay.
- Light, Dark, and System appearance selection is also available before sign-in.
- Platform UI copy, validation feedback, roles, statuses, dates, times, numbers, and
  currency are localized. Vendor-entered names, menu items, customer notes, and other
  business data are displayed exactly as entered and are never machine-translated.
- Displayed numbers follow the selected language: Marathi and Hindi use Devanagari
  digits, Gujarati uses Gujarati digits, and English uses Latin digits. This applies
  to tokens, quantities, counts, prices, currency, dates, and times.
- Technical values that must be copied or submitted exactly—IDs, route slugs, email
  addresses, credentials, HEX/RGB/HSL colors, and underlying numeric form values—keep
  their canonical stored representation.
- Message files use feature namespaces and ICU arguments. English is the structural
  reference locale; every locale must keep the same keys and argument contracts.
- Translation catalogs are public, code-owned assets. They must never contain secrets,
  tenant data, raw/rich HTML, executable URLs, or authorization decisions, and they may
  only render through ordinary React text paths.
- Catalog and rendering security validation must pass automatically before a production
  build and on protected-branch pull requests. Native review remains required because
  automation cannot determine whether valid wording is deceptive.
- Marathi copy requires native-speaker review on the real phone workflows before the
  pilot gate can pass. Hindi and Gujarati are supported drafts and also require native
  review before they are presented as production-quality translations.

## Accessibility And Visual Preferences Contract

- Staff can adjust text size from 100% to 200%, choose Regular, Medium, or Strong text
  weight, and select Standard, Color-safe, or High contrast color presentation.
- Accessibility settings are available before sign-in, in the authenticated desktop
  top bar, and in the mobile Account Sheet. Values and accessible value text follow the
  selected UI locale and numeral system.
- Preferences are presentation-only and device-local for the MVP. The validated
  `cms_platform_accessibility` cookie may change rendering but must never influence
  tenant access, roles, business data, pricing, or Server Action authorization.
- Invalid or edited cookie values fall back to the default 100%, Regular, Standard
  profile. Authenticated profile synchronization may be added later without changing
  the authorization model.
- Color-safe presentation changes semantic status and chart tokens; it does not apply a
  visual-impairment simulation filter to the page, photos, menu images, or vendor artwork.
  High contrast may override vendor accent presentation where necessary for legibility.
- Queue and Kitchen use the same active-order status mapping: Paid is blue, Preparing is
  amber/orange, and Ready is green. Status color stays restrained inside a labeled Badge
  with a small matching dot; full-card color fills are outside the calm operational UI
  direction.
- Color is never the only way to communicate an order, payment, stock, validation, or
  membership state. Visible text remains mandatory, with icons or shapes added where
  dense visualizations need another distinguishing cue.
- These controls are assistive options, not a promise of WCAG conformance and not a
  replacement for browser zoom, screen readers, operating-system settings, or testing
  with disabled users. The interface must still support 200% browser zoom and reflow.
- The implementation follows WCAG 2.2 guidance for
  [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html),
  [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), and
  [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Future Language Expansion

- Additional staff-interface languages are an allowed post-pilot expansion when there
  is a clear vendor need and an identified native reviewer. They do not require a new
  tenant model, route structure, or translation of vendor-entered business data.
- Each added language must define a BCP 47 locale, native selector label, browser-language
  mapping, numeral system, complete message catalog, appropriate Sans/Serif font coverage,
  and native review status.
- A new catalog must preserve the English reference namespaces, keys, ICU arguments,
  and stored enum values. Partial catalogs and silent English fallback are not permitted
  for a locale shown in the production language selector.
- Changing the Marathi default or expanding localization into vendor-entered content
  remains out of scope without explicit product approval.
- The required file structure, implementation sequence, and verification checklist are
  canonical in `docs/domains/localization.md` under "Adding A Future Locale."

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
- The translation security check passes, catalog changes have code-owner approval, and
  no raw HTML or catalog-controlled URL rendering path exists.

Operations gate:

- Menu, orders, kitchen progression, queue updates, and mobile layout work end to end.
- Realtime reconnect behavior is acceptable.

Trust gate:

- Terms, Privacy, support, admin-access policy, deletion, and export processes exist.

Pilot gate:

- One test vendor completes onboarding and one complete order lifecycle.
- Known limitations and support expectations are documented.
- A native Marathi reviewer completes the login, order, kitchen, queue, inventory,
  control, ledger, and reports terminology review on a representative phone viewport.
- Text remains usable at the 100%, 150%, and 200% in-app settings and at 200% browser
  zoom; keyboard and touch users can operate both sliders and all profile choices.
- Standard, Color-safe, and High contrast profiles are checked in light and dark modes,
  and no tested operational state relies on color alone.

## Open Decisions

- Whether managers may view limited finance summaries.
- Whether cashiers may cancel or refund orders.
- Whether kitchen members may record stock movements.
- Whether public queue displays require authentication.
- Whether future customer ordering uses no login, OTP, or another mechanism.
