- Refactored the dashboard counter-order UX to eliminate horizontal layout collisions,
  prevent whole-page vertical stretching, and separate active order monitoring into a global overlay:
  - Replaced the brittle quantity input & Add to Cart button layout in `OrderItemForm` with a full-width,
    bordered quantity stepper using localized minus/plus controls and a stacked full-width Add to Cart button;
    the quantity remains editable and validated to eliminate collisions on narrow cards.
  - Set `items-start` on the counter menu layout with container-bounded vertical scrolling (`max-h-[calc(100vh-20rem)] overflow-y-auto`)
    to prevent unrelated columns from stretching empty page height.
  - Converted Active Orders into a globally accessible right overlay slide-over sheet (`ActiveOrdersSheet`
    with `ActiveOrdersProvider`), accessible from any module via the topbar button, mobile bottom pill bar,
    or clickable metric summary card on the Order dashboard.
  - Added a layout-level `OrderCartProvider` and right-side `CartSheet`, keeping the inline Order cart while
    exposing Cart controls in the desktop topbar and mobile navigation on non-Order modules; the cart state
    persists across module navigation and the mobile Order panel keeps Create Counter Order before Current Cart.
  - Removed the three `WorkspaceInfoCards` from module dashboards so operational workspaces stay focused.
  - Reworked the mobile navigation into a left-side Menu plus spaced active-module icon/name group, with
    Active Orders, Cart, and Account actions grouped on the right; the outlet name is no longer repeated in the bar.
  - Widened the mobile Active Orders and Cart sheets to 92vw and added prominent mobile-only bottom Close buttons.
  - Gated the desktop and mobile Cart shortcuts with `canAccessModule(user.role, "order")` to maintain strict RBAC.
- Added full localized strings for `Shell.activeOrders`, `Shell.openActiveOrders`, `Shell.activeOrdersDescription`,
  `Shell.cart`, `Shell.openCart`, and `Shell.cartDescription` across English, Marathi, Hindi, and Gujarati,
  passing `npm run i18n:check` (600 messages).
- Added a Firefox/Chromium E2E regression proving a seeded cart remains available as a desktop and mobile overlay
  on the Queue module. Firefox verification passes 8/8, and Brave verifies the cart regression plus 6 other specs;
  its unrelated localized homepage check remains flaky on `hi-IN` ticker-height rotation.
- Verification passed: `npm run i18n:check`, `npm run typecheck`, `npm test` (unit, integration, subscriptions, media),
  scoped ESLint, `git diff --check`, and `npm run test:e2e` (8/8 Firefox specs).
- Expanded the anonymous homepage with three large, hero-style Inventory, Reports,
  and Ledger showcase Cards. Their previews and claims match the implemented product:
  stock movements and reorder levels; paid sales, estimated gross profit from recorded
  menu-item costs, completed orders, and low-stock counts; and receivable, payable,
  expense, due-date, note, and open-entry records.
- Added complete Marathi, English, Hindi, and Gujarati feature copy with exact key and
  ICU parity. Marathi remains first-class but still requires the documented native review;
  Hindi and Gujarati copy remains draft-quality pending native review.
- Prevented Indic display clipping by sizing the animated hero ticker from every localized
  statement, using a `1.08` line height and vertical inset, and giving shared Badges an
  explicit `1.4` line height plus larger vertical padding. Localized metric text no longer
  uses overflow-clipped truncation.
- Made the public header wrap with tighter phone padding so its scaled appearance controls
  do not create horizontal page overflow at 200% text size.
- Added stable `data-home-feature` hooks, cross-browser viewport resizing, and a Firefox
  regression covering Marathi, Hindi, and Gujarati at 390x844 and 1440x1000. At 200% text
  size it verifies three feature Cards, no Badge or ticker clipping, no horizontal overflow,
  and stable ticker height after rotation.
- Verification passed: `npm run i18n:check` (594 messages), `npm run typecheck`, scoped
  ESLint, `git diff --check`, `npm test`, `npm run build`, and `npm run test:e2e` (7/7).
  Repository-wide `npm run lint` remains blocked only by six pre-existing explicit-`any`
  errors in `tests/e2e/chromium-cdp.ts` and `tests/e2e/firefox-bidi.ts`.
- Replaced Noto Sans Devanagari and Noto Sans Gujarati with variable Anek Devanagari
  and Anek Gujarati for body and control text. Sans locale stacks now place Geist first,
  so Latin/English remains Geist in every locale while unsupported Indic glyphs fall
  through to the matching Anek script font, including mixed-script vendor content.
- Corrected serif heading stack order at the same boundary: Latin uses local Libre
  Baskerville first and Devanagari/Gujarati fall through to the existing Noto Serif fonts.
  Added the Anek SIL Open Font License 1.1 notice under `src/assets/fonts/`.\
- Reworked the accessibility color-profile selector into three descriptive, full-width
  ToggleGroup options. Standard, Color-safe, and High contrast now preview their
  light/dark surface pair plus Paid, Preparing, and Ready semantic colors before selection,\
  so Color-safe remains understandable on login and other pages without live statuses or charts.\
- Added localized profile descriptions across Marathi, English, Hindi, and Gujarati while
  preserving the existing device-local cookie contract and immediate root-token updates.\
- Diagnosed the deployed `https://kotdemo.vercel.app` accessibility failure as stale
  production CSS rather than a control or cookie bug. Firefox confirmed that production
  updates and persists `data-color-profile`, but its immutable stylesheet contains no
  Color-safe, High contrast, or semantic status rules; a fresh Vercel deployment is required.\
- Added shared Paid, Preparing, and Ready Badge variants backed by semantic blue,\
  amber/orange, and green tokens. Queue and Kitchen now use the same status mapper,\
  with restrained translucent fills, quiet borders, and small matching dots rather than
  full-card color. The first running-browser check exposed a stale Turbopack development
  bundle still serving the removed `status-positive` token; the subsequent source update
  regenerated the live stylesheet with all three current status tokens and Badge rules.\
- Defined separate light, dark, Color-safe, and High contrast values for every active
  order status while retaining the translated status label as the primary state cue.\
- Added a global accessibility preference model with strict parsing for the
  `cms_platform_accessibility` cookie. The Server Component root layout renders the
  selected size, semantic font weights, and color profile before first paint; invalid
  or edited values return to the 100%, Regular, Standard defaults.\
- Added official shadcn/Radix Slider and Popover primitives plus localized accessibility
  controls on the login page, desktop top bar, and mobile Account Sheet. Slider values
  use each locale's numeral system and expose localized accessible names/value text.\
- Text size supports 100%-200% in 10% steps. Text weight supports Regular, Medium, and
  Strong while preserving the normal/medium/semibold hierarchy. Pointer drags preview
  locally and commit on release so the control does not resize underneath the pointer.\
- Added Standard, Color-safe, and High contrast presentation profiles. Color-safe uses
  semantic status/chart tokens rather than a page-wide simulation filter; High contrast
  can override vendor branding, and operational meaning remains visible in text.\
- Documented the accessibility scope, device-local security boundary, WCAG Resize Text /\
  Use of Color / Non-text Contrast guidance, non-guarantee language, and verification
  gates in the product spec, UI style guide, and README.\
- Hardened `scripts/check-i18n.mjs` into a catalog and rendering security gate. It now
  rejects unexpected/oversized catalogs, unsafe structure or keys, markup/rich tags,\
  executable schemes, control and bidi-spoofing characters, invalid ICU contracts,\
  and prohibited raw HTML/dynamic-evaluation APIs under `src/`.\
- Added eight built-in security regression fixtures, including malicious markup, URL,\
  bidi, control-character, oversized-message, dangerous-key, and raw-React cases plus
  a safe Indic ZWJ case.\
- Added `prebuild` enforcement so local and Vercel production builds cannot proceed when
  translation security validation fails.\
- Added `.github/workflows/i18n-security.yml` for pull-request and `main` checks and
  `.github/CODEOWNERS` ownership for catalogs and enforcement files. GitHub branch
  protection still needs the documented external settings enabled.\
- Documented the React and next-intl raw/rich rendering boundary, public-catalog trust
  model, prohibited APIs, contributor workflow, and repository protections in the
  localization guide, product spec, UI guide, README, and AGENTS.md.\
- Added `next-intl` request configuration for stable, non-prefixed routes with locale
  resolution in this order: validated language cookie, `Accept-Language`, Marathi.\
- Added complete namespaced message catalogs for Marathi, English, Hindi, and Gujarati.\
  Marathi is the product default; the three Indic-language catalogs still need the
  native review gates documented in `docs/domains/localization.md`.\
- Localized the login flow, vendor shell, dashboard modules, form feedback, status
  labels, inventory, ledger, reports, and user-safe Server Action errors. Vendor-entered
  and database-provided business content remains unchanged.\
- Added language controls to the login page, desktop top bar, and mobile Account Sheet.\
  The final control is a shadcn DropdownMenu with a localized \"Select your language\"
  label and DropdownMenuRadioGroup; language selection no longer opens a dedicated
  Sheet or displays a permanent four-button grid. Selection persists in an HTTP-only
  same-site cookie and refreshes Server Components without adding locale segments.\
- Added the existing Light, Dark, and System control to the login page so appearance
  can be selected before authentication.\
- Added locale-aware Noto Sans/Serif Devanagari and Gujarati fonts while retaining Geist
  for Latin UI.\
- Changed displayed numerals to follow the selected language: Marathi and Hindi use
  Devanagari digits, Gujarati uses Gujarati digits, and English uses Latin digits.\
  Named next-intl formats cover integers, quantities, currency, dates, and times;\
  previously raw order counts and line-item quantities now use those formats as well.\
- Reworked plural-count messages to use an explicitly formatted value and added named
  number formatting to inventory quantities, avoiding ICU/default-digit mismatches.\
- Expanded `docs/domains/localization.md` with the canonical file structure and a complete
  future-locale workflow covering product approval, config, catalogs, loaders, fonts,\
  numeral systems, validation, visual coverage, native review, and documentation.\
- Added `npm run i18n:check`, which verifies JSON shape, English key parity, non-empty
  values, ICU syntax, and ICU argument parity across all 320 messages.\
- Installed exact `next-intl` and ICU-parser versions. Installation required npm's
  legacy peer-resolution mode because the current Next.js canary prerelease does not
  satisfy `next-intl`'s stable `^16.0.0` semver range; the production build passes.\
- Added a committed project `.npmrc` with `legacy-peer-deps=true` so clean local and
  Vercel npm installs reproduce that verified resolution. This fixes Vercel's ERESOLVE
  failure before the build while the project remains on Next.js 16.3.0-canary.69.\
- Connected vendor accent to shadcn primary buttons and focus-ring tokens.\
- Added automatic dark/light foreground selection for arbitrary vendor accent colors.\
- Fixed runtime heading-font propagation through --heading-font-family.\
- Added local Libre Baskerville through next/font/local.\
- Added accent-aware glass treatment to Cards, Sheets, Drawers, desktop top bar,\
  and mobile navigation without backdrop blur. The final gradient mixes the runtime
  vendor accent at 5% into the leading edge and 1% into the trailing edge.\
- Corrected desktop shell alignment with a shared 72 px sidebar/top-bar header height.\
- Moved the sidebar divider onto the fixed-height header itself; no separate separator
  contributes an extra pixel below the seam.\
- Increased the vendor identity control height and tightened line heights so the
  workspace location is not clipped; its collapsed avatar remains 32 px and centered.\
- Established shell stacking: sidebar z-20, sticky top bar z-30,\
  mobile navigation z-40, shadcn overlays z-50.\
- Added Light, Dark, and System controls to the desktop top bar and mobile Account Sheet.\
- Added a vendor-tinted workspace background at 2.5%, half the leading glass tint.\
- Replaced the wide mobile Control availability table with a two-column item/status
  treatment and 44 px icon action while preserving the full desktop table.\
- Restored mobile navigation as a fixed bottom bar with `z-40`, safe-area offset,\
  and `pb-28` reserved on dashboard content.\
- Added an accent-aware vertical fade behind the fixed mobile navigation. It blends\
  the vendor accent at 8% into the platform background at the bottom and transitions\
  to transparent without blur or blocked pointer events.\
- Added container-owned trailing spacing below the dynamic counter-order item grid,\
  keeping the final item card separated from the Active orders section on phones.\
- Corrected the vendor avatar sizing contract so it is 40 px when the sidebar is
  expanded and exactly 32 px inside the collapsed icon slot without clipping.\
- Consolidated MVP and role rules into `docs/product.md`, replaced the default
  Next.js README, and removed duplicate agent packs, installation archives, and
  unused starter assets in preparation for GitHub publication.\
- Mobile Menu and Account Sheets were verified in Firefox over ADB.\
- Order forms keep scroll position and use a 10-second pre-insert undo window.\
- Appearance presets, HEX/RGB/HSL input, native picker, and heading selection persist to Supabase.\
- Added immediate counter-menu search by item name or category using shadcn InputGroup.\
- Rebuilt Inventory around ingredient creation, stock-in/stock-out recording,\
  reorder levels, a live stock register, and recent movement history.\
- Added owner/admin/manager capability checks and tenant validation to inventory
  Server Actions; kitchen remains view-only until its configurable permission is approved.\
- Added a Supabase migration with temporary preview insert policies and atomic,\
  `SECURITY INVOKER` ingredient/movement functions. It is applied to the remote
  CMS Platform project and recorded in migration history.\
- Implemented deep cross-browser end-to-end automation across both Mozilla Firefox (Gecko)\
  and Brave Browser (Chromium 151 / Blink). Built native CDP bridge in `tests/e2e/chromium-cdp.ts`
  and unified the harness in `tests/e2e/firefox-bidi.ts`, supporting zero-dependency browser\
  automation with device metrics emulation (430x932), network cookie injection, file input
  dispatch, and browser error assertion.\
- Added `scripts/run-brave-e2e.mjs` and npm scripts `test:e2e:firefox`, `test:e2e:brave`, and\
  `test:e2e:all`. All 6 specs (counter order flow, login & mobile shell, kitchen queue progression,\
  vendor media upload & preview, and public acquisition) pass cleanly with 0 failures and 0\
  unhandled browser errors on both browser engines.\
\
DATABASE TEST STATE\
-------------------\
- RLS tests are authored but were not executed in this environment. The repository\
  still lacks the original baseline schema migration needed to reconstruct the remote\
  project, `psql` is unavailable, and no disposable `RLS_TEST_DATABASE_URL` was\
  supplied. The runner refuses an undeclared or non-local target by default.\
- The subscription/entitlement migration exists locally but is not applied remotely.\
  No remote subscription row, entitlement, grant, or policy was changed during this\
  implementation. The Basic/Pro/Enterprise feature matrix, pricing, trial duration,\
  and registration-time plan assignment remain explicit product decisions.\
- The vendor media migration exists locally but is not applied remotely. No production\
  Storage bucket, policy, or media row was changed during this implementation, and no\
  generated fixture was uploaded to Supabase.\
- Two orders created during ADB timing verification could not be deleted by the\
  publishable role because RLS correctly denies delete.\
- Those rows are neutralized as status=cancelled, payment_status=refunded, total=0.\
- Token numbers: 138 and 139.\
\
VERIFICATION\
------------\
- `npm test` passed the new unit and order-action integration suites together with\
  the existing subscription and Sharp media suites.\
- `npm run test:e2e:all` passed both Firefox 153 WebDriver BiDi and Brave (Chromium 151)\
  CDP workflows at 430x932 mobile viewport with zero unhandled browser errors.\
- `npm run typecheck`, `npm run lint`, `npm run i18n:check`, `npm run build`, and\
  `git diff --check` passed.\
\
PROJECT REVIEW ODT STYLING\
-------------------------\
- Regenerated the ERD/UML/module hierarchy and database dictionary ODTs with explicit\
  white table cells; a static, unlinked Contents list avoids LibreOffice field shading.\
  Subheadings use Geist Mono Regular and both cover titles read “KOT Platform”.\
- Updated the Mermaid palette to white fills and black borders, increased spacing, and\
  placed the sequence diagrams on landscape pages to reduce label collisions.\
- Set tables to collapsing borders so adjacent 0.5 pt cell edges render with a uniform weight.\\
- Both ODT packages were opened/exported by headless LibreOffice; final ODT fills were\
  checked for white table backgrounds.\
