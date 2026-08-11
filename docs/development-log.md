CMS PLATFORM - DEVELOPMENT LOG
=======================================

STATUS
------
State: Active development
Last updated: 2026-08-09 (Asia/Kolkata)
Current stack: Next.js 16 canary, React 19, shadcn/ui Nova with Radix, Tailwind CSS v4, Supabase

PURPOSE
-------
This file is the current implementation handoff for developers and coding models.
Read it before changing the project. Update it after every implementation task that
changes files, verification status, blockers, database state, or the next recommended work.

CURRENT UI DIRECTION
--------------------
- Platform identity remains charcoal and operational.
- Vendor accent is runtime data from Supabase and is limited to primary actions,
  focus rings, vendor marks, and subtle surface tinting.
- Heading font is a runtime vendor setting: Geist Sans or local Libre Baskerville.
- Glass surfaces use translucency, accent-derived gradients, normal borders,
  inset highlights, and restrained shadows.
- Backdrop blur is prohibited.
- Light, Dark, and System modes use next-themes and semantic shadcn tokens.
- The vendor workspace background receives a 2.5% accent mix, half the leading
  glass-surface tint strength.
- Mobile navigation uses shadcn/Radix bottom Sheets from a fixed two-action bar.
- The staff interface is Marathi-first with English, Hindi, and Gujarati support.
  Language and theme preferences are both available before authentication.
- Device-local accessibility controls provide 100%-200% text sizing, three text-weight
  levels, and Standard, Color-safe, or High contrast profiles before and after sign-in.

LATEST CHANGES
--------------
- Removed the extra animation-frame delay before the hydrated theme control renders, and added a Firefox regression check for the mobile Account Sheet avatar upload, preview, and device-local persistence. Typecheck, lint, media normalization tests, and all five Firefox E2E tests pass.
- Verified the active dev host is `192.168.1.6`; the existing `allowedDevOrigins` pattern allows `http://192.168.1.6:3000` and its JavaScript chunks. An unlisted dev host returns `403`, so Android should use the LAN URL or USB reverse mode with `http://127.0.0.1:3000`. ADB currently reports no connected device, so Android Firefox logs remain unavailable.
- Added an explicit development-only media mode so the mock workspace can test
  file selection, preview, and device-local persistence without weakening the
  production Supabase Auth and membership gate. Vendor logos and private profile
  pictures now expose the flow in Control, desktop Account, and mobile Account
  surfaces; production uploads still use the authenticated Sharp-to-WebP API.
- Reworded private profile guidance so owners may choose any image they prefer,
  and added localized demo-save feedback across all four catalogs.
- Added a Firefox WebDriver BiDi media-flow test using `input.setFiles`. It verifies
  an owner can select the generated PNG fixture, save the demo preview, render a
  data URL, and retain the value in browser storage.
- Added ADR 0005 documenting why development media previews remain device-local
  until production Supabase Auth, membership, and Storage migration are ready.
- Final verification for this slice passed `npm test`, `typecheck`, `lint`,
  `i18n:check`, `build`, and all three Firefox headless E2E flows. The guarded
  RLS suite still needs an explicit disposable `RLS_TEST_DATABASE_URL`.
- Replaced the top-level documentation handoff with the five canonical files:
  `product.md`, `architecture.md`, `security.md`, `roadmap.md`, and
  `development-log.md`. Detailed UI and localization rules now live under
  `docs/domains/`, research is separated, and existing architecture diagrams remain
  under `docs/diagrams/`.
- Reduced `AGENTS.md` to a routing file while preserving Next.js's generated canary
  warning. It routes work through the current log, relevant specification, security
  invariants, required checks, and ADR updates, and instructs humans and agents to
  update routing when durable documentation directories or project skills change.
- Replaced the two provisional ADRs with four explicit decisions: `vendor_id` as the
  tenant boundary, database-enforced authorization, domain-oriented source layout,
  and PWA validation before a native wrapper.
- Added executable unit suites for membership permissions, order transitions, and
  inventory calculations. Production order/inventory code now consumes the extracted
  pure rules instead of duplicating those calculations inside Server Actions.
- Added an order-action integration suite covering fixture authentication, role denial,
  cross-workspace rejection, normalization, and quantity limits.
- Added rollback-only pgTAP RLS suites for tenant isolation and subscription-role
  permissions plus a guarded `test:rls` runner that requires a disposable database.
- Added deterministic Firefox WebDriver BiDi E2E suites for cashier order scheduling
  with Undo and kitchen-to-queue navigation. The runner uses a separate `.next-e2e`
  directory and a development-only server fixture so it neither conflicts with a
  developer's active Next process nor depends on remote Supabase availability.
- Reorganized the application into a domain-oriented modular monolith under
  `src/features/`. Orders, Kitchen, Queue, Inventory, Ledger, Reports, Vendors,
  Memberships, Auth, Menu, and Subscriptions now own their domain components,
  actions, policies, data access, or configuration. App Router files remain thin;
  reusable shadcn primitives and genuinely cross-domain dashboard components remain
  shared.
- Split the former all-purpose workspace operations file into feature-owned Server
  Actions and moved shared FormData parsing into `src/lib/form-data.ts`. This changes
  source ownership without changing route URLs or the current preview workflows.
- Added provider-neutral subscription domain contracts for plans, entitlements,
  limits, provider synchronization, webhook storage, and runtime schema parsing.
  Entitlement windows use inclusive starts and exclusive ends; a null limit means
  unlimited. Payment-provider selection remains deliberately outside this slice.
- Added `20260728165042_subscription_entitlements.sql` with subscription plans,
  feature catalog, plan features, vendor subscriptions, and vendor entitlements.
  The migration includes constraints, indexes, explicit Data API grants, RLS, tenant
  membership/billing-manager checks, and a same-vendor subscription-entitlement
  integrity constraint. Basic, Pro, Enterprise, and the seven current module features
  are seeded, but plan-to-feature assignments are not invented.
- Recorded the modular-monolith and authorization-boundary decisions under
  `docs/decisions/`. Business capabilities, vendor entitlements, and member
  permissions are separate layers: a user may perform an operation only when the
  vendor is entitled to the feature and that member has permission.
- Added focused subscription tests for active-window semantics, disabled grants,
  finite and unlimited limits, and rejection of unsupported provider statuses.
- Added a production-oriented vendor-logo and member-avatar media pipeline. JPEG, PNG,
  and WebP inputs are decoded and validated with Sharp, auto-oriented, metadata-stripped,
  resized to a 512 px square, and encoded as bounded-size WebP. Logos retain transparency
  with contain fitting; profile images use attention-based cover fitting.
- Added a Node-runtime multipart media API with same-origin and request-size checks,
  authenticated Supabase user/membership validation, tenant and role authorization,
  immutable UUID object paths, metadata records, asset linking, and compensating cleanup.
  It does not use a service-role key or bypass RLS.
- Added separate public vendor-logo and private member-avatar Storage designs plus
  authenticated-only metadata and object policies in
  `supabase/migrations/20260728141655_vendor_media_assets.sql`. The migration has not
  been applied to the remote project because this environment has no authenticated
  Supabase CLI/MCP connection.
- Added localized shadcn-composed logo and profile-picture upload controls to Control,
  the desktop account popover, and the mobile Account Sheet. They deliberately remain
  disabled while the application uses mock workspace authentication; production
  Supabase Auth membership is required before remote upload can be enabled safely.
- Generated an original text-free City Canteen logo fixture and committed transparent
  PNG, JPEG, and WebP variants under `tests/fixtures/media/`. The WebP upload fixture is
  approximately 46 KiB at 1254x1254 before normalization.
- Added media normalization regression tests for all accepted formats, output dimensions,
  byte budgets, metadata removal, declared/decoded MIME mismatch, SVG rejection, and
  oversized input rejection.
- Pinned and deduplicated Sharp at 0.35.3, including Next.js's nested use, to remove the
  earlier Sharp advisory. The remaining npm audit findings are unrelated transitive
  Next.js/PostCSS, shadcn tooling, fast-uri, and brace-expansion advisories and still
  require dependency-lifecycle review rather than a forced update.
- Corrected the shared Popover's stale opacity animation class after Firefox exposed an
  open but visually transparent account popover.
- Replaced Noto Sans Devanagari and Noto Sans Gujarati with variable Anek Devanagari
  and Anek Gujarati for body and control text. Sans locale stacks now place Geist first,
  so Latin/English remains Geist in every locale while unsupported Indic glyphs fall
  through to the matching Anek script font, including mixed-script vendor content.
- Corrected serif heading stack order at the same boundary: Latin uses local Libre
  Baskerville first and Devanagari/Gujarati fall through to the existing Noto Serif fonts.
  Added the Anek SIL Open Font License 1.1 notice under `src/assets/fonts/`.
- Reworked the accessibility color-profile selector into three descriptive, full-width
  ToggleGroup options. Standard, Color-safe, and High contrast now preview their
  light/dark surface pair plus Paid, Preparing, and Ready semantic colors before selection,
  so Color-safe remains understandable on login and other pages without live statuses or charts.
- Added localized profile descriptions across Marathi, English, Hindi, and Gujarati while
  preserving the existing device-local cookie contract and immediate root-token updates.
- Diagnosed the deployed `https://kotdemo.vercel.app` accessibility failure as stale
  production CSS rather than a control or cookie bug. Firefox confirmed that production
  updates and persists `data-color-profile`, but its immutable stylesheet contains no
  Color-safe, High contrast, or semantic status rules; a fresh Vercel deployment is required.
- Added shared Paid, Preparing, and Ready Badge variants backed by semantic blue,
  amber/orange, and green tokens. Queue and Kitchen now use the same status mapper,
  with restrained translucent fills, quiet borders, and small matching dots rather than
  full-card color. The first running-browser check exposed a stale Turbopack development
  bundle still serving the removed `status-positive` token; the subsequent source update
  regenerated the live stylesheet with all three current status tokens and Badge rules.
- Defined separate light, dark, Color-safe, and High contrast values for every active
  order status while retaining the translated status label as the primary state cue.
- Added a global accessibility preference model with strict parsing for the
  `cms_platform_accessibility` cookie. The Server Component root layout renders the
  selected size, semantic font weights, and color profile before first paint; invalid
  or edited values return to the 100%, Regular, Standard defaults.
- Added official shadcn/Radix Slider and Popover primitives plus localized accessibility
  controls on the login page, desktop top bar, and mobile Account Sheet. Slider values
  use each locale's numeral system and expose localized accessible names/value text.
- Text size supports 100%-200% in 10% steps. Text weight supports Regular, Medium, and
  Strong while preserving the normal/medium/semibold hierarchy. Pointer drags preview
  locally and commit on release so the control does not resize underneath the pointer.
- Added Standard, Color-safe, and High contrast presentation profiles. Color-safe uses
  semantic status/chart tokens rather than a page-wide simulation filter; High contrast
  can override vendor branding, and operational meaning remains visible in text.
- Documented the accessibility scope, device-local security boundary, WCAG Resize Text /
  Use of Color / Non-text Contrast guidance, non-guarantee language, and verification
  gates in the product spec, UI style guide, and README.
- Hardened `scripts/check-i18n.mjs` into a catalog and rendering security gate. It now
  rejects unexpected/oversized catalogs, unsafe structure or keys, markup/rich tags,
  executable schemes, control and bidi-spoofing characters, invalid ICU contracts,
  and prohibited raw HTML/dynamic-evaluation APIs under `src/`.
- Added eight built-in security regression fixtures, including malicious markup, URL,
  bidi, control-character, oversized-message, dangerous-key, and raw-React cases plus
  a safe Indic ZWJ case.
- Added `prebuild` enforcement so local and Vercel production builds cannot proceed when
  translation security validation fails.
- Added `.github/workflows/i18n-security.yml` for pull-request and `main` checks and
  `.github/CODEOWNERS` ownership for catalogs and enforcement files. GitHub branch
  protection still needs the documented external settings enabled.
- Documented the React and next-intl raw/rich rendering boundary, public-catalog trust
  model, prohibited APIs, contributor workflow, and repository protections in the
  localization guide, product spec, UI guide, README, and AGENTS.md.
- Added `next-intl` request configuration for stable, non-prefixed routes with locale
  resolution in this order: validated language cookie, `Accept-Language`, Marathi.
- Added complete namespaced message catalogs for Marathi, English, Hindi, and Gujarati.
  Marathi is the product default; the three Indic-language catalogs still need the
  native review gates documented in `docs/domains/localization.md`.
- Localized the login flow, vendor shell, dashboard modules, form feedback, status
  labels, inventory, ledger, reports, and user-safe Server Action errors. Vendor-entered
  and database-provided business content remains unchanged.
- Added language controls to the login page, desktop top bar, and mobile Account Sheet.
  The final control is a shadcn DropdownMenu with a localized "Select your language"
  label and DropdownMenuRadioGroup; language selection no longer opens a dedicated
  Sheet or displays a permanent four-button grid. Selection persists in an HTTP-only
  same-site cookie and refreshes Server Components without adding locale segments.
- Added the existing Light, Dark, and System control to the login page so appearance
  can be selected before authentication.
- Added locale-aware Noto Sans/Serif Devanagari and Gujarati fonts while retaining Geist
  for Latin UI.
- Changed displayed numerals to follow the selected language: Marathi and Hindi use
  Devanagari digits, Gujarati uses Gujarati digits, and English uses Latin digits.
  Named next-intl formats cover integers, quantities, currency, dates, and times;
  previously raw order counts and line-item quantities now use those formats as well.
- Reworked plural-count messages to use an explicitly formatted value and added named
  number formatting to inventory quantities, avoiding ICU/default-digit mismatches.
- Expanded `docs/domains/localization.md` with the canonical file structure and a complete
  future-locale workflow covering product approval, config, catalogs, loaders, fonts,
  numeral systems, validation, visual coverage, native review, and documentation.
- Added `npm run i18n:check`, which verifies JSON shape, English key parity, non-empty
  values, ICU syntax, and ICU argument parity across all 320 messages.
- Installed exact `next-intl` and ICU-parser versions. Installation required npm's
  legacy peer-resolution mode because the current Next.js canary prerelease does not
  satisfy `next-intl`'s stable `^16.0.0` semver range; the production build passes.
- Added a committed project `.npmrc` with `legacy-peer-deps=true` so clean local and
  Vercel npm installs reproduce that verified resolution. This fixes Vercel's ERESOLVE
  failure before the build while the project remains on Next.js 16.3.0-canary.69.
- Connected vendor accent to shadcn primary buttons and focus-ring tokens.
- Added automatic dark/light foreground selection for arbitrary vendor accent colors.
- Fixed runtime heading-font propagation through --heading-font-family.
- Added local Libre Baskerville through next/font/local.
- Added accent-aware glass treatment to Cards, Sheets, Drawers, desktop top bar,
  and mobile navigation without backdrop blur. The final gradient mixes the runtime
  vendor accent at 5% into the leading edge and 1% into the trailing edge.
- Corrected desktop shell alignment with a shared 72 px sidebar/top-bar header height.
- Moved the sidebar divider onto the fixed-height header itself; no separate separator
  contributes an extra pixel below the seam.
- Increased the vendor identity control height and tightened line heights so the
  workspace location is not clipped; its collapsed avatar remains 32 px and centered.
- Established shell stacking: sidebar z-20, sticky top bar z-30,
  mobile navigation z-40, shadcn overlays z-50.
- Added Light, Dark, and System controls to the desktop top bar and mobile Account Sheet.
- Added a vendor-tinted workspace background at 2.5%, half the leading glass tint.
- Replaced the wide mobile Control availability table with a two-column item/status
  treatment and 44 px icon action while preserving the full desktop table.
- Restored mobile navigation as a fixed bottom bar with `z-40`, safe-area offset,
  and `pb-28` reserved on dashboard content.
- Added an accent-aware vertical fade behind the fixed mobile navigation. It blends
  the vendor accent at 8% into the platform background at the bottom and transitions
  to transparent without blur or blocked pointer events.
- Added container-owned trailing spacing below the dynamic counter-order item grid,
  keeping the final item card separated from the Active orders section on phones.
- Corrected the vendor avatar sizing contract so it is 40 px when the sidebar is
  expanded and exactly 32 px inside the collapsed icon slot without clipping.
- Consolidated MVP and role rules into `docs/product.md`, replaced the default
  Next.js README, and removed duplicate agent packs, installation archives, and
  unused starter assets in preparation for GitHub publication.
- Mobile Menu and Account Sheets were verified in Firefox over ADB.
- Order forms keep scroll position and use a 10-second pre-insert undo window.
- Appearance presets, HEX/RGB/HSL input, native picker, and heading selection persist to Supabase.
- Added immediate counter-menu search by item name or category using shadcn InputGroup.
- Rebuilt Inventory around ingredient creation, stock-in/stock-out recording,
  reorder levels, a live stock register, and recent movement history.
- Added owner/admin/manager capability checks and tenant validation to inventory
  Server Actions; kitchen remains view-only until its configurable permission is approved.
- Added a Supabase migration with temporary preview insert policies and atomic,
  `SECURITY INVOKER` ingredient/movement functions. It is applied to the remote
  CMS Platform project and recorded in migration history.

DATABASE TEST STATE
-------------------
- RLS tests are authored but were not executed in this environment. The repository
  still lacks the original baseline schema migration needed to reconstruct the remote
  project, `psql` is unavailable, and no disposable `RLS_TEST_DATABASE_URL` was
  supplied. The runner refuses an undeclared or non-local target by default.
- The subscription/entitlement migration exists locally but is not applied remotely.
  No remote subscription row, entitlement, grant, or policy was changed during this
  implementation. The Basic/Pro/Enterprise feature matrix, pricing, trial duration,
  and registration-time plan assignment remain explicit product decisions.
- The vendor media migration exists locally but is not applied remotely. No production
  Storage bucket, policy, or media row was changed during this implementation, and no
  generated fixture was uploaded to Supabase.
- Two orders created during ADB timing verification could not be deleted by the
  publishable role because RLS correctly denies delete.
- Those rows are neutralized as status=cancelled, payment_status=refunded, total=0.
- Token numbers: 138 and 139.

VERIFICATION
------------
- `npm test` passed the new unit and order-action integration suites together with
  the existing subscription and Sharp media suites.
- `npm run test:e2e` passed both Firefox 153 headless workflows at 430x932 using
  isolated, development-only fixture data. The cashier test schedules and undoes the
  order before its 10-second write boundary; the kitchen test verifies role-scoped
  navigation and completes the transition to Queue.
- `npm run typecheck`, `npm run lint`, `npm run i18n:check`, `npm run build`, and
  `git diff --check` passed after the documentation/test restructure. The
  localization gate validated 374 messages across four locales, eight security
  fixtures, and 112 source files.
- After the feature reorganization and subscription foundation, `npm run lint`,
  `npx tsc --noEmit`, `npm run test:subscriptions`, `npm run test:media`,
  `npm run i18n:check`, `git diff --check`, and the final `npm run build` passed.
  The localization gate validated 374 messages across four locales, eight security
  fixtures, and 108 application source files.
- Clean Firefox 153 WebDriver BiDi against the production server rechecked Control at
  430x932, the mobile Account profile form, and the desktop account popover at
  1440x900 after the file moves. There was no horizontal overflow or browser console
  error; the media inputs retained their expected disabled mock-auth boundary, and a
  direct media POST still returned HTTP 401.
- Remote migration listing/application and linked database lint were not possible:
  the environment has no Supabase access token or connected Supabase MCP session.
- `npm run test:media`, `npm run lint`, `npx tsc --noEmit`, `npm run i18n:check`,
  `git diff --check`, and the final `npm run build` passed for the media implementation.
  The localization gate validated 374 messages across four locales, eight security
  fixtures, and 98 source files; the production build emitted `/api/media`.
- `npm ls sharp` resolves both the direct application dependency and Next.js's nested
  dependency to Sharp 0.35.3.
- Clean Firefox 153 WebDriver BiDi at 430x932 verified the logo input contract, disabled
  mock-auth state, explanatory authentication boundary, mobile profile form, and no
  horizontal overflow. At 1440x900 it verified the desktop account popover and profile
  form without clipping; the browser emitted no page console errors.
- A direct multipart request under the mock session returned HTTP 401 `auth-required`,
  confirming that the API cannot turn the temporary workspace cookie into Supabase
  Storage authority.
- After the Anek migration, `npm run lint`, `npx tsc --noEmit`, `npm run i18n:check`,
  and `npm run build` passed. The production build self-hosts Anek Devanagari and Anek
  Gujarati and contains no application references to Noto Sans.
- Production-server locale checks rendered `Geist -> Anek Devanagari` for Marathi/Hindi,
  `Geist -> Anek Gujarati` for Gujarati, and Geist alone for English. Clean Firefox 153
  captures at 430x932 confirmed Anek Indic copy, Geist English/mixed-script content, and
  no visible horizontal clipping on Marathi or Gujarati login flows.
- After the color-profile selector rework, `npm run lint`, `npx tsc --noEmit`, and
  `npm run i18n:check` passed. The localization gate validated 344 messages across four
  locales, eight security fixtures, and 93 application source files.
- Clean Firefox 153 WebDriver BiDi at 430x932 rendered all three descriptive profile
  options and three palette previews inside the accessibility popover without horizontal
  overflow. Selecting Color-safe immediately set the root profile and resolved
  `--status-paid` to `#006397`.
- Comparative Firefox testing confirmed localhost applies and persists High contrast
  (`#fff` background, `#000` foreground, `#004f84` Paid), while the current Vercel
  deployment persists the cookie/attribute but resolves none of those profile tokens.
- An isolated `npm run build` passed without touching the active dev server's `.next`
  directory. Its emitted production CSS contains both profile selectors, all three preview
  selectors, the vendor-workspace High contrast override, and all six light/dark values
  for each Paid, Preparing, and Ready token.
- After the visibility correction, `npm run lint`, `npx tsc --noEmit`,
  `npm run i18n:check`, and `git diff --check` passed. The stylesheet currently served
  by localhost contains all three semantic token values plus the 15% fill, 40% border,
  colored-text, and status-dot utilities. A new production build was not started while
  the active Turbopack development server was using the shared `.next` directory.
- `npm run lint`, `npx tsc --noEmit`, `npm run i18n:check`, `git diff --check`, and
  `npm run build` passed after unifying Queue and Kitchen status colors. The generated
  production CSS contains the new paid, preparing, and ready token utilities.
- `npm run i18n:check` passed for 341 messages across four locales, eight security
  fixtures, and 93 application source files after adding accessibility copy.
- `npm run lint`, `npx tsc --noEmit`, `git diff --check`, and the final production
  `npm run build` passed after the accessibility implementation. The build visibly ran
  the translation security prebuild gate first.
- Local production HTML checks confirmed that `200:500:high-contrast` renders a 200%
  root size, 500/600/700 semantic weights, High contrast data attribute, Gujarati font,
  and Gujarati copy. A malformed `999:999:javascript` cookie returned to the 100%,
  400/500/600, Standard English defaults.
- Checked selected profile foreground colors against their intended light/dark
  foundations: sampled ratios ranged from 5.60:1 to 13.83:1. Status text remains
  present independently of those colors.
- Headless Firefox at 430x932 rendered the visible English login flow at the 200%,
  Strong, High contrast settings without visible horizontal clipping; the top preference
  controls wrapped and the content reflowed vertically. The CLI exited before its
  client-mounted theme control was captured.
- An authenticated 200% headless capture was attempted, but Firefox produced compositor /
  shutdown artifacts, so it is not recorded as a dashboard visual pass.
- Hardened `npm run i18n:check`: passed for 320 messages across four locales, eight
  security fixtures, and 88 application source files.
- Explicit malicious probes: HTML-like script markup, `javascript:` schemes, bidi
  overrides, and React raw-HTML rendering were rejected; safe Indic ZWJ text passed.
- npm run lint and npx tsc --noEmit: passed after security enforcement changes.
- npm run build: passed and visibly ran `prebuild` translation security validation before
  the Next.js production build.
- Clean temporary dependency install using only `package.json`, `package-lock.json`,
  and the committed `.npmrc`: `npm config get legacy-peer-deps` returned `true` and
  `npm install --ignore-scripts --no-audit --no-fund` installed 701 packages without
  the Vercel-reported ERESOLVE conflict.
- npm run i18n:check: passed; 320 messages validated across four locales.
- npm run lint: passed after the complete localization extraction.
- npx tsc --noEmit: passed after the complete localization extraction.
- npm run build: passed with Next.js 16.3.0-canary.69 after allowing the build to
  download and bundle the configured Google Fonts.
- Production-server smoke test: `mr-IN`, `en-IN`, `hi-IN`, and `gu-IN`
  `Accept-Language` requests returned matching `html lang` values, translated titles,
  and a rendered login form.
- Locale precedence smoke test: the Gujarati cookie overrode a Marathi browser header;
  an unsupported French header fell back to Marathi.
- npm run i18n:check, npm run lint, npx tsc --noEmit, and npm run build: passed after
  replacing the language Sheet with the shadcn dropdown and adding login theme controls.
- Production HTML check at `/login`: English response retained `lang=en-IN`, exposed
  the localized `Select your language` accessible label, and rendered the English
  language trigger. A new automated Firefox screenshot was attempted but the local
  headless compositor did not produce an image, so this is not recorded as a visual pass.
- npm run i18n:check, npm run lint, npx tsc --noEmit, and npm run build: passed after
  enabling locale-specific numeral systems and removing raw dashboard number rendering.
- Authenticated production-server smoke test: all four Order dashboard responses retained
  their matching HTML language and rendered the configured digits. Currency samples were
  Marathi `₹७८५`, Hindi `₹७८५`, Gujarati `₹૭૮૫`, and English `₹785`; Indic responses also
  contained native digits in other formatted dashboard values.
- npm run lint: passed after the latest shell, dark-mode, and mobile-table changes.
- npx tsc --noEmit: passed after the latest shell, dark-mode, and mobile-table changes.
- npm run build: passed after repository cleanup and the prior mobile navigation-row change.
- npm run lint and npx tsc --noEmit: passed after the order-grid trailing-spacing
  and collapsed vendor-avatar fixes.
- npm run lint and npx tsc --noEmit: passed after restoring the fixed mobile
  navigation layout.
- npm run lint and npx tsc --noEmit: passed after counter search and inventory management.
- npm run lint and npx tsc --noEmit: passed after anchoring inventory form
  footers to the bottom of equal-height desktop cards.
- Headless Firefox 1440x900: accent tint, Serif headings, expanded desktop seam,
  complete sidebar location, and top-bar stacking verified.
- Headless Firefox 430x932: mobile glass tint, Serif headings, cards, navigation,
  and the compact availability treatment verified without horizontal clipping.
- Headless Firefox 430x932: the fixed navigation fade transitions smoothly from
  transparent above the bar to the opaque vendor tint at the viewport bottom.
- Mobile dashboard content reserves bottom space for the fixed navigation surface.
- Headless Firefox 430x4200 Order view: the dynamic menu grid retains a full trailing
  spacing unit after its final item before the Active orders section.
- Headless Firefox 430x1200 Order view: search control, result count, item cards,
  and fixed navigation render without horizontal clipping.
- Headless Firefox 430x2200 Inventory view: ingredient forms, movement controls,
  stock register, and movement history render without horizontal clipping.
- Headless Firefox 430x1100 Inventory view: the controlled unit selector renders
  its Kilograms default and the fixed navigation remains usable.
- Remote anonymous inventory test: created an ingredient at 2 kg, recorded -0.5 kg,
  received 1.5 kg, and verified opening plus movement logs. All verification rows
  were removed afterward.
- Supabase database advisors: no issues after inventory policy/RPC migration.
- Supabase migration history: `20260713202753` matches locally and remotely.
- Actual Android Firefox: Menu Sheet, Account Sheet, close controls, account-card
  border, custom appearance persistence, and local serif preview verified.
- Actual Android Firefox over adb reverse: Account Sheet theme control verified;
  System followed the phone's dark setting, Light applied immediately, and System
  restored dark mode. Mobile availability actions remained visible and tappable.
- Fresh-profile Firefox login-route hydration check produced no warning. A warning
  seen once in the pre-existing Android tab was not reproducible after clean navigation.
- Search confirmed no blur/backdrop-filter usage remains under src/.
- Repository cleanup preserved canonical architecture reports/diagrams and upstream
  agent skills while removing exact duplicate copies.

OPEN RISKS / NEXT WORK
----------------------
- Choose the first vendor-registration policy before implementing account creation:
  private-pilot invite/manual activation or public self-service vendor-owner signup.
  Also choose whether a newly created vendor receives no entitlements until activation,
  a defined Basic trial, or a paid/selectable plan. A Basic trial requires both its
  duration and the Basic plan feature/limit matrix.
- After those choices, replace preview authentication with Supabase Auth and implement
  owner onboarding as one database transaction: create the vendor, create the active
  owner membership from the authenticated user ID, assign the approved subscription
  or entitlement state, and make retries idempotent. Email confirmation, duplicate
  organization handling, abandoned signup recovery, and cross-tenant RLS tests are
  part of that slice.
- Authenticate the Supabase CLI or connect the project MCP, then review and apply
  `20260728165042_subscription_entitlements.sql` on staging, run database lint/advisors,
  and test anonymous, ordinary-member, billing-manager, owner, platform-service, and
  cross-tenant access before using the catalog in application routes.
- Replace temporary workspace authentication with Supabase Auth, apply and review
  `20260728141655_vendor_media_assets.sql` on a staging project, run Supabase database
  lint/advisors, and exercise owner/admin/manager/self/cross-tenant upload cases before
  enabling the controls. This is the hard prerequisite for storing vendor/member images.
- Decide and implement object lifecycle cleanup for replaced unreferenced media. The
  upload path is immutable and safely links the newest asset, but long-term orphan
  collection should be an explicit scheduled maintenance policy.
- Review the remaining production dependency audit findings without using a forced major
  update, then repeat the complete build and browser checks after dependency changes.
- Redeploy the current source to Vercel, then repeat the clean Firefox profile switch and
  reload check against `https://kotdemo.vercel.app`. The current deployment serves stale
  immutable CSS without the profile or semantic status selectors.
- Complete a real-browser keyboard, touch, and screen-reader pass for both sliders,
  localized value text, popover scrolling, profile persistence, and Reset. Recheck the
  authenticated dashboard and mobile Account Sheet at 100%, 150%, and 200% on Android
  Firefox; the headless authenticated capture was not reliable.
- Validate Color-safe and High contrast presentation with users who have color-vision or
  low-vision access needs. The current semantic palettes and contrast checks improve the
  foundation but do not, by themselves, promise WCAG conformance or individual benefit.
- When charts are implemented, pair hue with labels, shapes, or patterns and test every
  chart in all three profiles; the current product has chart tokens but no complete chart
  workflow to visually validate.
- Enable a GitHub ruleset or branch protection for `main` that requires pull requests,
  `Validate translation security`, Code Owner approval, stale-approval dismissal, and
  blocked force pushes/deletion. CODEOWNERS cannot enforce review until this is enabled.
- Complete native-speaker review of Marathi across all phone-first operational flows;
  this is a release gate, not an optional copy edit.
- Complete native review of the Hindi and Gujarati drafts before describing them as
  production-quality translations.
- Visually test long Marathi, Hindi, and Gujarati labels at desktop and phone viewports,
  including Android Firefox. Review Anek at 100%, 150%, and 200% text size plus Regular,
  Medium, and Strong weights with native speakers before release. Include native digit
  clarity in tokens, quantities,
  currency, dates, times, and editable numeric fields. This implementation pass verified
  rendered server HTML, but did not perform a new screenshot or physical-device pass.
- Persist locale to the authenticated staff profile when profile-backed preferences are
  introduced. The current one-year cookie is intentionally device-local.
- Recheck the restored fixed mobile navigation on Android Firefox when the phone is
  connected again.
- Verify the revised desktop seam once more in the collapsed sidebar state.
- Dashboard sales and counts currently derive from the latest 20 fetched orders,
  not a database aggregate. Replace this with tenant-scoped aggregate queries or RPCs.
- Replace temporary workspace credentials with Supabase Auth memberships before production.
- Add database migrations and RLS policies to source control; the current remote schema
  is not represented by migration SQL in supabase/.

MODEL HANDOFF CHECKLIST
-----------------------
Use the routing sequence in `AGENTS.md`; it is the canonical entry point.
