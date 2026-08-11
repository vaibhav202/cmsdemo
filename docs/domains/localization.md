# Localization Domain Specification

This guide defines the implementation and review contract for the staff interface.
It supplements the product specification and UI style guide; it does not change tenant,
role, or business-data behavior.

## Supported Locales

| Locale | Native label | Digits | Product status |
| --- | --- | --- | --- |
| `mr-IN` | मराठी | Devanagari (`deva`) | Default; first-class Maharashtra pilot language; native review required |
| `en-IN` | English | Latin (`latn`) | Structural reference locale |
| `hi-IN` | हिंदी | Devanagari (`deva`) | Implemented draft; native review required |
| `gu-IN` | ગુજરાતી | Gujarati (`gujr`) | Implemented draft; native review required |

The native label is always shown unchanged so a user can recover from selecting an
unfamiliar language.

## Runtime Contract

- URLs are stable and never receive a locale prefix.
- Locale precedence is the validated `cms_platform_locale` cookie, a supported browser
  `Accept-Language` preference, then `mr-IN`.
- The root layout sets the matching HTML `lang`, locale font variables, translated
  metadata, and the `next-intl` provider used by interactive client components.
- Font stacks are script-prioritized rather than locale-exclusive: Geist remains first for
  Latin glyphs in every Sans locale stack, while Devanagari and Gujarati fall through to
  their Anek script fonts. Mixed-script vendor content therefore preserves Geist English.
- React Server Components resolve translations and locale-aware formats on the server.
- Language changes run through a Server Action that validates the locale, writes an
  HTTP-only same-site cookie, and refreshes the current route.
- The login page, desktop top bar, and mobile Account Sheet use a shadcn DropdownMenu
  with a localized "Select your language" label and radio items in native script.
  Language selection never opens its own Sheet or Drawer.
- The login page exposes the same Light, Dark, and System preference used inside the
  authenticated workspace.
- Message catalogs are JSON files under `messages/`. Their top-level feature namespaces
  are `Metadata`, `Common`, `Auth`, `Shell`, `Module`, `Order`, `Kitchen`, `Queue`,
  `Control`, `Inventory`, `Ledger`, `Reports`, and `WorkspaceError`.
- `messages/en-IN.json` is the key and ICU-argument reference. Run `npm run i18n:check`
  after every message change.
- `src/i18n/config.ts` maps each locale to its numeral system. `src/i18n/request.ts`
  applies that mapping to the named integer, quantity, currency, date, and time formats.

## Content Boundaries

Translate:

- Platform navigation, headings, instructions, actions, and accessibility labels.
- Roles, membership states, order states, stock movement types, and measurement units.
- Platform-generated validation, success, empty-state, and safe error messages.
- Dates, times, quantities, counts, and Indian rupee currency formatting.

Do not translate:

- Vendor, location, staff, customer, menu-item, ingredient, or category names.
- Notes, references, or any other text entered by a vendor or customer.
- Stable database values, route slugs, IDs, email addresses, or authorization data.

User-entered text may contain more than one script. Preserve it exactly as stored.
Displayed operational values use the locale digit mapping above. IDs, route slugs,
email addresses, passwords, color codes, database values, and form submission payloads
remain canonical and must not be transliterated.

## File Structure

```text
messages/
  en-IN.json                 English key and ICU reference
  mr-IN.json                 Marathi catalog
  hi-IN.json                 Hindi catalog
  gu-IN.json                 Gujarati catalog
scripts/
  check-i18n.mjs             catalog parity and ICU validation
src/i18n/
  config.ts                  locale list, labels, fallback, browser mapping, digits
  messages.ts                statically analyzable catalog loaders
  request.ts                 request locale resolution and named formats
  types.d.ts                 next-intl locale/message/format type augmentation
src/app/actions/locale.ts    validated preference cookie Server Action
src/components/shell/
  language-control.tsx       shared language dropdown
src/lib/fonts.ts             locale Sans and heading font coverage
.github/CODEOWNERS           review ownership for catalogs and enforcement
.github/workflows/
  i18n-security.yml          pull-request and main-branch catalog security check
```

Catalogs use one JSON file per locale. Every catalog has the same feature namespaces:
`Metadata`, `Common`, `Auth`, `Shell`, `Module`, `Order`, `Kitchen`, `Queue`, `Control`,
`Inventory`, `Ledger`, `Reports`, and `WorkspaceError`. Components request the narrowest
namespace they own; stored database enums remain language-neutral.

All dynamic display numbers must use a named next-intl format. Use
`useDashboardFormats()` for dashboard currency, integer, and quantity output;
`useFormatter()` for dates and times; and a server formatter or an ICU named number
style inside Server Actions. Do not use raw JSX numbers or `String(number)` for display.
ICU plural `#` follows the locale's implicit default and can bypass an explicit numeral
mapping, so plural messages should render a separately formatted value such as
`formattedCount` when the configured numbering system must be guaranteed.

## Translation Security Contract

Translation catalogs are public application assets, not executable configuration and
not a secret store. They may contain platform copy and ICU formatting instructions only.
Do not put credentials, API keys, internal diagnostics, authorization decisions, HTML,
URLs, or tenant data in `messages/*.json`.

The application follows the security boundary described by the official guidance:

- React renders translations as ordinary string children or inert text attributes.
  React warns that untrusted raw HTML passed through `dangerouslySetInnerHTML` creates
  an XSS risk: <https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html>.
- next-intl parses normal ICU messages. Its raw-message guidance requires sanitization
  before using `t.raw` with `dangerouslySetInnerHTML`:
  <https://next-intl.dev/docs/usage/translations#raw-messages>.
- Rich text in next-intl requires explicit tag-to-component functions. This project does
  not permit catalog-controlled rich text, markup, attributes, or links:
  <https://next-intl.dev/docs/usage/translations#rich-text>.

The following APIs and patterns are prohibited under `src/`:

- React `dangerouslySetInnerHTML`.
- DOM `innerHTML`, `outerHTML`, or `insertAdjacentHTML`.
- Dynamic evaluation through `eval` or `new Function`.
- next-intl `t.raw`, `t.markup`, or `t.rich` rendering.
- Translation values used as `href`, `src`, form actions, style values, or executable
  attributes. URLs and link destinations must remain code-owned constants.
- Runtime catalog downloads, tenant-uploaded catalogs, or direct production updates
  from a translation service. External translations must enter through reviewed files.

Introducing rich text or translated link destinations requires explicit security review,
a narrow code-owned component allowlist, URL validation, sanitization where applicable,
tests, and an update to this contract before implementation.

### Automated enforcement

`npm run i18n:check` is a required security gate. It validates:

- The exact allowlisted catalog filenames and maximum catalog size.
- JSON structure, nesting depth, message count, key shape, and dangerous object keys.
- English-reference key parity, non-empty values, valid ICU syntax, and ICU argument parity.
- Maximum message length, executable URL schemes, HTML/XML-like or ICU rich-text tags,
  control characters, and invisible/bidirectional direction controls.
- Application source for raw React/DOM HTML injection, dynamic evaluation, and next-intl
  raw, markup, or rich translation APIs.
- Built-in malicious fixtures plus a safe Indic ZWJ fixture on every run, preventing the
  enforcement rules themselves from silently regressing. ZWJ and ZWNJ remain allowed
  because they can be linguistically required; code-owned direction and layout handle RTL.

The `prebuild` package script runs this gate automatically before every `npm run build`,
including Vercel production builds. `.github/workflows/i18n-security.yml` runs it on every
pull request and every push to `main`. `.github/CODEOWNERS` assigns the catalogs and their
enforcement files to `@vaibhav202`.

CODEOWNERS requests review but only becomes a merge requirement after GitHub branch
protection or a ruleset is enabled. Protect `main` with all of the following:

1. Require a pull request before merging.
2. Require review from Code Owners and dismiss stale approvals after new commits.
3. Require the `Validate translation security` status check.
4. Block force pushes and branch deletion.

Machine checks prevent injection-shaped content and structural corruption. They cannot
decide whether a grammatically valid translation is deceptive. A native reviewer must
still confirm that security warnings, destructive actions, payment states, roles, and
permissions retain their intended meaning.

## Adding A Future Locale

Adding a language is a complete product slice, not only a JSON-file addition:

1. Confirm the vendor need, BCP 47 locale, native language label, numeral system, and
   named native reviewer. Do not change the Marathi default without product approval.
2. Add the locale to `supportedLocales`, `localeOptions`, `localeByLanguage`, and
   `localeNumberingSystems` in `src/i18n/config.ts`. The language dropdown is generated
   from `localeOptions`; do not create a locale-specific selector component.
3. Copy `messages/en-IN.json` to `messages/<locale>.json` and translate every value while
   preserving all namespaces, keys, ICU arguments, plural branches, and stored enums.
   Do not publish a partial catalog or silently fall back to English.
4. Add a static loader for the catalog in `src/i18n/messages.ts` and add the locale to
   the list checked by `scripts/check-i18n.mjs`.
5. Add suitable Sans and Serif/heading font coverage in `src/lib/fonts.ts`. Prefer a
   script-specific font that covers both platform copy and vendor-entered mixed text;
   keep the intended Latin family first so emails, identifiers, and mixed-script names do
   not inherit Latin glyphs bundled inside an Indic font.
6. Review every numeric named format in `src/i18n/request.ts`. Add the locale's Unicode
   numbering-system identifier and verify integers, decimals, currency, dates, times,
   tokens, and plural counts. Canonical form and database values must remain numeric.
7. Run `npm run i18n:check`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
   Smoke-test browser negotiation, cookie override, HTML `lang`, unchanged route paths,
   and the language dropdown's keyboard behavior.
8. Visually test login and every permitted dashboard at desktop and representative phone
   sizes. Check wrapping, truncation, fonts, native digits, mixed-script vendor content,
   validation, empty states, and errors; then obtain native-review approval.
9. Record the locale, reviewer status, verification, limitations, and release readiness
   in `docs/development-log.md`, and update the supported-locale tables in this
   guide, `docs/product.md`, `docs/domains/ui.md`, and `README.md`.
10. Submit the change through a pull request. The catalog security workflow and code-owner
    review must pass; do not import translations directly into the production branch.

## Translation Review

The current Indic catalogs are implementation drafts, not proof of native linguistic
approval. Review Marathi first with a Maharashtra restaurant or canteen operator.

For each locale, a reviewer should complete these flows on a representative phone:

1. Sign in and change language before and after authentication.
2. Search the menu, create an order, undo, and read active-order states.
3. Progress an order through kitchen and queue states.
4. Create an ingredient and record both stock-in and stock-out movements.
5. Review Control, Ledger, Reports, role labels, empty states, validation, and errors.
6. Check truncation, wrapping, font fallback, terminology consistency, tone, and clarity.

Record approved terminology changes directly in the locale JSON, keep ICU arguments
unchanged, run the localization checker, lint, type checking, and a production build,
then update the live development log with the reviewer and coverage.
