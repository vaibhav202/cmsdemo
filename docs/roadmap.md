CANTEEN/CAFE MANAGEMENT SAAS - DELIVERY ROADMAP
===================================================================

Document purpose:
- Define the development lifecycle for the SaaS platform.
- Convert the product direction into an execution roadmap.
- Explain how agentic workflows can safely assist development.
- Mark where manual testing, review, and owner decisions are required.

Recommended SDLC:
- Lean Agile SDLC with DevSecOps gates.

Short meaning:
- Lean: validate decisions with real vendors before overbuilding.
- Agile: build in small cycles and keep feedback loops short.
- DevSecOps: include security, testing, and release checks in every development cycle.

Why this model fits:
- The product is still being validated with local vendors.
- The target users may be non-technical and mobile-first.
- Multi-vendor data isolation is security-critical.
- Legal, privacy, and trust requirements must evolve with the product.
- A strict Waterfall model would be too slow.
- A loose "just keep coding" model would be too risky.


1. CORE DEVELOPMENT PRINCIPLE
=============================

Main engineering question:
- Can one real vendor safely run daily operations on this system from a phone?

Everything should support that question.

Priority order:
1. Tenant security.
2. Auth and roles.
3. Vendor dashboard separation.
4. Core daily workflows.
5. Pilot feedback.
6. Ledger, inventory, and reports.
7. Mobile packaging.
8. Paid launch operations.

Do not prioritize:
- Feature count over correctness.
- Visual polish over data safety.
- Play Store packaging before real usage.
- Reports before reliable operational data.
- Automation before clear manual checks.


2. SDLC LOOP
============

Use this loop for every development cycle:

1. Discovery
   - Identify the user problem.
   - Confirm whether the feature is required now.
   - Define the smallest useful version.

2. Design
   - Decide database changes.
   - Decide route changes.
   - Decide permission rules.
   - Decide UI states.
   - Decide test requirements.

3. Build
   - Implement the smallest safe slice.
   - Keep changes scoped.
   - Avoid unrelated refactors.

4. Verify
   - Run automated tests.
   - Run RLS/security tests.
   - Run manual mobile workflow checks.
   - Check build output.

5. Pilot
   - Try the workflow with realistic vendor behavior.
   - Record friction, confusion, and failure points.

6. Iterate
   - Fix the smallest important problems.
   - Remove unnecessary complexity.
   - Update documentation.

7. Release
   - Release only when gates are satisfied.
   - Keep rollback path clear.
   - Record what changed.


3. DEVELOPMENT CADENCE
======================

Recommended cadence:
- 1-week cycles during architecture and MVP.
- 2-week cycles after the first pilot begins.

Weekly cycle format:
- Day 1: plan and design.
- Day 2-4: implementation.
- Day 5: verification, manual testing, documentation, release decision.

For solo/student development:
- Keep process lightweight.
- Use checklists instead of heavy meetings.
- Use documentation as memory for future agents.
- Avoid building many partially complete features in parallel.


4. PHASE ROADMAP
================

Phase 0 - Current Demo Preservation
-----------------------------------

Goal:
- Treat current Vite demo as UX reference, not production foundation.

Inputs:
- Existing Vite app.
- Existing local mock data.
- Existing diagrams and platform architecture report.

Work items:
- Preserve current UX flows.
- Document what must migrate to NextJS.
- Avoid adding production auth directly into the demo app.

Exit criteria:
- Demo is understood as reference material.
- Production rebuild direction is clear.
- NextJS foundation can begin.

Evidence:
- Architecture report exists.
- Project structure diagram exists.
- Supabase structure diagram exists.
- Security/upload flow diagram exists.


Phase 1 - NextJS Production Foundation
--------------------------------------

Goal:
- Create the app foundation for production development.

Tech target:
- NextJS App Router.
- TypeScript.
- TailwindCSS.
- Shadcn UI.
- Vercel hosting.

Work items:
- Create NextJS project.
- Add TailwindCSS.
- Add Shadcn UI.
- Add base layout.
- Add public pages: login, terms, privacy.
- Add protected route structure under /app/[vendorSlug].
- Add environment variable conventions.

Exit criteria:
- App runs locally.
- App builds successfully.
- Basic routes exist.
- Deployment target is Vercel-ready.

Manual tests:
- Open app on desktop.
- Open app on mobile viewport.
- Verify route navigation.
- Verify basic responsive layout.

Agent tasks suitable here:
- Scaffold routes.
- Create layout shell.
- Add UI primitives.
- Convert static demo components into NextJS-compatible components.

Manual owner decisions:
- Brand/product name.
- Final route naming.
- Visual direction.


Phase 2 - Auth and Tenant Foundation
------------------------------------

Goal:
- Establish secure login and vendor membership model.

Core tables:
- vendors.
- profiles.
- vendor_members.

Work items:
- Add Supabase project configuration.
- Add Supabase SSR client.
- Add login flow.
- Add session handling.
- Add vendor membership lookup.
- Add role-based route guard.
- Add seed users/vendors for testing.

Exit criteria:
- User can log in.
- User can only access vendors they belong to.
- Disabled member cannot access dashboard.
- Missing vendor membership shows access denied.

Manual tests:
- Login as owner.
- Login as cashier.
- Login as kitchen user.
- Attempt invalid vendor route.
- Disable a member and verify access is removed.

Agent tasks suitable here:
- Create auth helpers.
- Create route guards.
- Create vendor context loader.
- Write seed data.
- Write permission utility functions.

Manual owner decisions:
- Exact roles.
- Invite flow timing.
- Whether staff can be created by owner in MVP.


Phase 3 - RLS and Security Gate
-------------------------------

Goal:
- Prove tenant isolation before building major features.

Work items:
- Enable RLS on tenant-owned tables.
- Write base vendor membership policies.
- Write role-specific policies.
- Add test SQL or scripted policy tests.
- Document policy assumptions.

Required tests:
- Vendor A cannot read Vendor B data.
- Vendor A cannot write Vendor B data.
- Owner can manage vendor resources.
- Cashier cannot manage admin-only resources.
- Kitchen user cannot access ledger.
- Disabled member cannot access data.
- Unauthenticated user cannot access protected tables.

Exit criteria:
- RLS tests pass.
- Manual cross-vendor tests pass.
- No feature work proceeds until this is stable.

Agent tasks suitable here:
- Draft migrations.
- Draft RLS policies.
- Draft test cases.
- Explain policy behavior.

Manual owner decisions:
- Which roles can perform each action.
- Whether customer ordering is public or protected.

Hard rule:
- Do not add business features on top of untested RLS.


Phase 4 - Dashboard Separation
------------------------------

Goal:
- Separate dashboards by vendor and role.

Target routes:
- /app/[vendorSlug]/order
- /app/[vendorSlug]/kitchen
- /app/[vendorSlug]/queue
- /app/[vendorSlug]/control
- /app/[vendorSlug]/inventory
- /app/[vendorSlug]/ledger
- /app/[vendorSlug]/reports

Work items:
- Move current order dashboard behind vendor route.
- Move kitchen dashboard behind vendor route.
- Move queue dashboard behind vendor route.
- Move control/admin dashboard behind vendor route.
- Add unauthorized states.
- Add mobile navigation.

Exit criteria:
- Role can only access intended dashboards.
- Route refresh works.
- Direct URL access is protected.
- Mobile layout remains usable.

Manual tests:
- Open each route as owner.
- Open each route as cashier.
- Open each route as kitchen.
- Open each route as accountant.
- Try direct route entry.
- Test on mobile viewport.

Agent tasks suitable here:
- Port components.
- Refactor dashboard layout.
- Add permission mapping.
- Add route-level empty/denied states.


Phase 5 - Menu and Orders Backend
---------------------------------

Goal:
- Replace mock menu/orders with Supabase-backed operations.

Tables:
- menu_categories.
- menu_items.
- orders.
- order_items.

Work items:
- Add menu CRUD.
- Add item availability toggle.
- Add order creation.
- Add offline/counter payment status flow.
- Add kitchen status progression.
- Add queue data source.

Exit criteria:
- Menu persists in database.
- Orders persist in database.
- Kitchen status updates persist.
- Queue reflects current order state.
- RLS still passes.

Manual tests:
- Add menu item.
- Disable menu item.
- Create order.
- Confirm counter payment.
- Move order from confirmed to processing to ready to completed.
- Check queue display.
- Verify another vendor cannot see the order.

Agent tasks suitable here:
- Build CRUD APIs/actions.
- Build form validation.
- Build query helpers.
- Port demo order logic into server-backed workflow.


Phase 6 - Realtime Queue
------------------------

Goal:
- Make kitchen and queue updates live.

Work items:
- Add Supabase Realtime subscriptions.
- Scope subscriptions by vendor_id.
- Handle reconnects.
- Handle stale state.
- Handle mobile app resume.

Exit criteria:
- Kitchen update appears in queue without refresh.
- Queue does not show another vendor's orders.
- Reconnect behavior is acceptable.

Manual tests:
- Open kitchen and queue in two browser windows.
- Update order status.
- Disconnect/reconnect network.
- Test mobile viewport.

Agent tasks suitable here:
- Add subscription hooks.
- Add cleanup logic.
- Add reconnect banner.
- Add stale-state handling.


Phase 7 - Storage and Image Uploads
-----------------------------------

Goal:
- Add normalized image uploads for logos, menu items, and staff avatars.

Tables:
- media_assets.

Buckets:
- vendor-public-assets.
- vendor-private-assets.

Work items:
- Add upload API route.
- Validate auth and membership.
- Validate role.
- Validate MIME type and size.
- Use Sharp for resizing/compression.
- Upload WebP output to Supabase Storage.
- Insert media_assets row.
- Link asset to vendor/menu/member.

Exit criteria:
- Vendor logo upload works.
- Menu item image upload works.
- Staff avatar upload works.
- Oversized/unsupported files are rejected politely.
- Vendor does not manually compress images.

Manual tests:
- Upload phone JPG.
- Upload PNG.
- Upload unsupported file.
- Upload large file.
- Verify final image size and format.
- Verify storage path includes vendor_id.

Agent tasks suitable here:
- Build API route.
- Add Sharp processing.
- Add storage helper.
- Add upload UI.
- Add validation messages.


Phase 8 - Pilot Readiness
-------------------------

Goal:
- Prepare for private Pune vendor pilot.

Work items:
- Add basic terms page.
- Add privacy policy page.
- Add support contact.
- Add vendor settings.
- Add audit logs for sensitive actions.
- Add backup/export plan.
- Add pilot onboarding checklist.

Exit criteria:
- One vendor can be onboarded manually.
- Vendor can log in and use daily flow.
- Support process is clear.
- Data deletion/export process is documented.

Manual tests:
- Onboard a test vendor.
- Add staff accounts.
- Add menu items.
- Run one full ordering workflow.
- Export key vendor data manually or through initial tooling.

Agent tasks suitable here:
- Draft pages.
- Add settings screens.
- Add audit log table.
- Add simple export utilities.

Manual owner decisions:
- Pilot pricing.
- Pilot duration.
- Support hours.
- Refund/cancellation terms.


Phase 9 - Business Features
---------------------------

Goal:
- Add value features after core operations are stable.

Features:
- Ledger.
- Expenses.
- Inventory.
- Profit/loss summary.
- Stocking suggestions.

Order:
1. Ledger ledger.
2. Expenses.
3. Basic profit/loss summary.
4. Stock items.
5. Stock movements.
6. Menu item ingredients.
7. Stocking suggestions.

Exit criteria:
- Finance data is vendor-isolated.
- Reports match source data.
- Inventory suggestions explain why they are suggested.

Manual tests:
- Add party.
- Add debit/credit entry.
- Add expense.
- Generate daily summary.
- Add stock item.
- Record stock movement.
- Verify report totals.


Phase 10 - Mobile Packaging
---------------------------

Goal:
- Package app for Android only after web/PWA usage is proven.

Work items:
- Improve PWA install behavior.
- Add Capacitor.
- Test Android app lifecycle.
- Test session persistence.
- Test network transitions.
- Prepare Play Store requirements.

Exit criteria:
- App is stable as PWA.
- Vendors want installable app.
- Play Store cost and compliance effort is justified.

Manual tests:
- Android install/open.
- Login persistence.
- App resume.
- Offline/online transition.
- Realtime reconnect.


5. RELEASE GATES
================

Gate 1 - Architecture Gate
--------------------------

Required before:
- Production rebuild starts.

Checklist:
- Target stack decided.
- Supabase schema direction drafted.
- Tenant model understood.
- Documentation created.

Pass evidence:
- Architecture report.
- SDLC roadmap.
- Diagrams.


Gate 2 - Security Gate
----------------------

Required before:
- Real business features.

Checklist:
- Supabase Auth works.
- vendor_members works.
- RLS policies exist.
- RLS tests pass.
- Role checks exist.
- Cross-vendor access fails.

Pass evidence:
- Test logs.
- SQL policy files.
- Manual test notes.


Gate 3 - MVP Operations Gate
----------------------------

Required before:
- Private vendor pilot.

Checklist:
- Menu works.
- Orders work.
- Kitchen queue works.
- Realtime works.
- Mobile layout works.
- Basic support process exists.

Pass evidence:
- Manual test checklist.
- Demo video or screenshots.
- Build output.


Gate 4 - Pilot Readiness Gate
-----------------------------

Required before:
- Onboarding first real vendor.

Checklist:
- Basic terms page.
- Basic privacy page.
- Support contact.
- Vendor onboarding flow.
- Backup/export plan.
- Admin access policy.

Pass evidence:
- Pilot checklist.
- Vendor agreement draft.
- Privacy/terms draft.


Gate 5 - Paid Launch Gate
-------------------------

Required before:
- Charging subscription fees publicly.

Checklist:
- CA reviewed tax/invoice/GST approach.
- Lawyer reviewed terms/privacy/vendor agreement.
- Subscription pricing defined.
- Refund/cancellation policy defined.
- Support process defined.
- Security basics verified.

Pass evidence:
- Legal document versions.
- Invoice/accounting setup.
- Production release notes.


6. AGENTIC DEVELOPMENT WORKFLOW
===============================

Goal:
- Use agents to speed up implementation while keeping security and product direction controlled.

Recommended workflow:

1. Human defines objective.
   - Example: "Add vendor-scoped route guard for kitchen dashboard."

2. Agent reads context.
   - Architecture report.
   - SDLC roadmap.
   - Relevant source files.
   - Existing tests.

3. Agent proposes implementation scope.
   - Files to change.
   - Data model impact.
   - Permission impact.
   - Test plan.

4. Agent implements.
   - Small scoped change.
   - No unrelated refactors.
   - No broad rewrites without approval.

5. Agent verifies.
   - Run build.
   - Run tests.
   - Run lint/typecheck if available.
   - Report failures clearly.

6. Human manually tests.
   - Especially auth, mobile UX, and cross-vendor behavior.

7. Documentation updates.
   - Update report, roadmap, or schema notes when decisions change.


7. AGENT TASK TEMPLATE
======================

Use this format when asking an agent to implement a feature:

Task:
- Short description.

Goal:
- User/business result.

Scope:
- Files or modules likely involved.

Data impact:
- Tables, columns, migrations, RLS policies, or storage paths.

Permission impact:
- Which roles can access or modify this feature.

Validation:
- Client validation.
- Server validation.
- Database/RLS validation.

Testing:
- Automated tests.
- Manual tests.

Out of scope:
- Things the agent should not modify.

Acceptance criteria:
- Exact conditions for completion.


8. EXAMPLE AGENT TASK
=====================

Task:
- Add role-based protection for the kitchen dashboard.

Goal:
- Only owner, admin, manager, and kitchen roles can access /app/[vendorSlug]/kitchen.

Scope:
- Vendor layout.
- Permission helper.
- Kitchen route/page.
- Unauthorized state.

Data impact:
- No database schema change.

Permission impact:
- Allowed: owner, admin, manager, kitchen.
- Denied: cashier, accountant, disabled member, non-member.

Validation:
- Server must verify active vendor membership.
- Frontend may hide links, but server route must enforce access.

Testing:
- Login as kitchen user and open route.
- Login as cashier and try direct route.
- Login as disabled member and try route.
- Try route for another vendor.

Out of scope:
- Do not modify order status logic.
- Do not modify menu management.

Acceptance criteria:
- Authorized roles can view kitchen dashboard.
- Unauthorized roles see access denied.
- Direct URL entry is protected.
- Build passes.


9. MANUAL TESTING STRATEGY
==========================

Manual testing is required for:
- Mobile usability.
- Vendor onboarding.
- Auth/session behavior.
- Realtime behavior.
- Image upload UX.
- Legal/trust flows.
- Cross-vendor security sanity checks.

Manual testing is not optional when:
- RLS changes.
- Auth changes.
- Role permissions change.
- Upload/storage logic changes.
- Financial/ledger logic changes.
- Production release is planned.

Manual test record should include:
- Date.
- Build/version.
- Browser/device.
- User role.
- Vendor.
- Test case.
- Result.
- Notes.


10. MINIMUM MANUAL TEST CHECKLIST
=================================

Auth:
- Login works.
- Logout works.
- Session survives refresh.
- Forgot password path exists or is planned.

Vendor isolation:
- Vendor A cannot access Vendor B route.
- Vendor A cannot see Vendor B orders.
- Disabled member loses access.

Roles:
- Owner can access all intended dashboards.
- Cashier cannot access admin-only pages.
- Kitchen cannot access ledger.
- Accountant cannot manage kitchen queue unless allowed.

Orders:
- Create order.
- Confirm offline payment.
- Progress order status.
- Complete order.
- Queue updates.

Menu:
- Add item.
- Edit item.
- Disable item.
- Archive item.

Images:
- Upload JPG.
- Upload PNG.
- Reject unsupported file.
- Reject oversized file.
- Verify optimized WebP output.

Mobile:
- Open on phone-sized viewport.
- Tap targets are usable.
- Navigation is clear.
- No text overlap.
- Realtime reconnect message is understandable.

Trust/legal:
- Terms page visible.
- Privacy page visible.
- Support contact visible.
- Vendor data ownership language exists.


11. AUTOMATED TESTING STRATEGY
==============================

Current automated suites:
- `tests/unit/permissions.test.ts` covers the role matrix and active-membership gate.
- `tests/unit/order-transitions.test.ts` covers the canonical order state machine.
- `tests/unit/inventory-calculations.test.ts` covers quantity validation, precision,
  movement deltas, and stock underflow.
- `tests/integration/order-actions.test.ts` covers the authenticated fixture,
  role/tenant boundary, normalization, and validation of order commands.
- `tests/rls/tenant-isolation.sql` and `tests/rls/role-permissions.sql` exercise
  production RLS policies in rollback-only transactions.
- `tests/e2e/cashier-order-flow.spec.ts` and
  `tests/e2e/kitchen-queue-flow.spec.ts` run through Firefox WebDriver BiDi.
- Media normalization and subscription-entitlement tests remain focused suites.

Highest priority automated tests:
- RLS tenant isolation.
- Role permission checks.
- Order state transitions.
- Ledger calculations.
- Image upload validation.

Build checks:
- `npm test`: deterministic unit, integration, subscription, and media suites.
- `npm run test:e2e`: isolated Next.js development server plus Firefox headless.
- `npm run test:rls`: requires `RLS_TEST_DATABASE_URL` pointing to a disposable,
  migration-complete Postgres database. A non-local database also requires the
  explicit `RLS_TEST_ALLOW_REMOTE=1` acknowledgement.
- `npm run typecheck`.
- `npm run lint`.
- `npm run i18n:check`.
- `npm run build`.
- `npm run test:all`: complete suite when the disposable RLS database and Firefox
  prerequisites are available.

Note:
- Automated tests help catch regressions.
- Manual tests are still needed for vendor workflows and mobile usability.


12. DOCUMENTATION WORKFLOW
==========================

Update documentation when:
- Database schema changes.
- Role permissions change.
- Route structure changes.
- Legal/business model changes.
- Launch phase changes.
- Storage/image rules change.
- New vendor-facing feature is added.

Documents to maintain:
- product.md
- architecture.md
- security.md
- roadmap.md
- development-log.md
- domains/
- decisions/
- diagrams/hq-text/*.png
- diagrams/hq-text/*.svg
- future schema/migration notes

Recommended doc update rule:
- If an agent changes architecture, it must update docs in the same task.


13. RISK REGISTER
=================

Risk:
- Cross-vendor data leak.
Impact:
- Critical legal/trust failure.
Control:
- RLS tests, manual cross-vendor checks, scoped queries.

Risk:
- Building too many features before pilot.
Impact:
- Slow launch and unclear product fit.
Control:
- Phase gates and pilot feedback.

Risk:
- Vendors struggle with onboarding.
Impact:
- Low adoption.
Control:
- Mobile-first UX, simple forms, automatic image optimization.

Risk:
- Legal pages do not match product behavior.
Impact:
- Trust and compliance issues.
Control:
- Keep privacy/terms updated; lawyer review before paid launch.

Risk:
- Realtime becomes unreliable on mobile.
Impact:
- Queue/kitchen confusion.
Control:
- Reconnect indicators, stale-state handling, manual mobile tests.

Risk:
- Financial reports are wrong.
Impact:
- Vendor trust loss.
Control:
- Clear calculation logic, test data, manual verification.


14. ROADMAP RULES FOR AGENTS
============================

Agents should:
- Read architecture and SDLC docs before major work.
- Keep changes small and reviewable.
- Preserve tenant isolation.
- Add tests for security-sensitive changes.
- Update docs when decisions change.
- Explain assumptions.
- Report what could not be verified.

Agents should not:
- Add features before foundational gates.
- Bypass RLS with service role keys in user flows.
- Store secrets in client code.
- Change legal/business assumptions silently.
- Introduce unrelated refactors.
- Treat frontend route guards as security.
- Add payment/marketplace behavior without explicit approval.


15. ROADMAP SUMMARY
===================

Recommended order:
1. Preserve demo as UX reference.
2. Build NextJS/Vercel foundation.
3. Add Supabase Auth and vendor_members.
4. Add RLS and security tests.
5. Separate dashboards by vendor and role.
6. Move menu and orders to Supabase.
7. Add realtime queue.
8. Add Storage and Sharp image upload.
9. Prepare private Pune pilot.
10. Add ledger, expenses, inventory, and reports.
11. Package with Capacitor later if real usage justifies it.
12. Prepare Play Store only after web/PWA product is stable.

Final engineering stance:
- Build slowly where mistakes are expensive.
- Build quickly where feedback is cheap.
- Security, tenant isolation, and vendor trust are not optional features.
