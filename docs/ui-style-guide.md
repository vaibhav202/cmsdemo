# CMS Platform UI Style Guide

This guide is mandatory for developers and coding models working on the product UI.
It supplements the installed shadcn skill and keeps vendor customization from replacing
the platform identity.

## Product Character

- Build a quiet, efficient restaurant operations workspace.
- Optimize for repeated use, scanning, touch accuracy, and low-cost Android phones.
- Keep CMS Platform recognizable through charcoal neutrals, restrained spacing,
  consistent component behavior, and predictable navigation.
- Add visual depth selectively. Avoid decorative layouts that compete with operational data.

## Component System

- Use installed shadcn/ui components before creating markup or a new abstraction.
- Use shadcn variants before class overrides.
- Use `className` for layout. Put reusable visual treatment in semantic tokens or
  an approved primitive variant.
- Forms use `FieldGroup` and `Field`.
- Two to seven mutually exclusive options use `ToggleGroup`.
- `SelectItem`, menu items, and command items must be inside their matching Group.
- Cards use full `CardHeader`, `CardContent`, and `CardFooter` composition when applicable.
- Sheets, Drawers, and Dialogs always include an accessible title.
- Use Sonner for toasts, `Empty` for empty states, `Badge` for status, and `Separator`
  for dividers.
- Use Lucide icons. Icons inside Buttons use `data-icon` and no manual size class.
- Do not construct a complete component from custom CSS when a shadcn primitive exists.

## Platform And Vendor Branding

Platform-owned:

- Page background, body text, neutral cards, navigation structure, spacing, and interaction patterns.
- Charcoal-based default theme and CMS Platform naming.
- Body font uses Geist Sans for Latin text and locale-matched Noto Sans for Devanagari
  or Gujarati text.

Vendor-controlled:

- `--vendor-brand`: vendor accent selected in Control > Brand appearance.
- `--vendor-brand-foreground`: automatically selected readable text color.
- `--heading-font-family`: Geist Sans or local Libre Baskerville.

Approved accent usage:

- Primary/default command Buttons.
- Focus rings.
- Vendor avatar/logo fallback and workspace mark.
- Subtle glass gradient tint and border tint.
- Half-strength page-background tint inside a vendor workspace.
- Selected operational highlights when the status meaning remains clear.

Do not apply vendor accent to body copy, every icon, full page backgrounds, every status,
or all navigation text. Vendor theming must not erase the platform identity.

## Typography

- Body and control text use `font-sans`. The root locale supplies Geist Sans,
  Noto Sans Devanagari, or Noto Sans Gujarati through `--font-ui-sans`.
- Product and workspace headings use `font-heading`.
- `font-heading` resolves through the runtime `--heading-font-family` token.
- Locale-aware heading fallbacks use Noto Serif Devanagari or Noto Serif Gujarati
  when a vendor selects the serif heading option.
- Page `h1` and major section titles may use the selected heading font.
- Compact labels, table text, input text, badges, and long descriptions remain Sans.
- Do not apply serif to dense operational data.
- Do not use viewport-scaled font sizes or negative letter spacing.

## Language And Locale UI

- Supported UI locales are Marathi (`mr-IN`), English (`en-IN`), Hindi (`hi-IN`),
  and Gujarati (`gu-IN`); Marathi is the default.
- Show every language in its native script: `मराठी`, `English`, `हिंदी`, `ગુજરાતી`.
- Place the language control on the login page, desktop top bar, and mobile Account Sheet.
- Use a shadcn DropdownMenu with a visible localized "Select your language" label and
  a DropdownMenuRadioGroup for the four exclusive choices. Do not open a dedicated
  Sheet or Drawer for language selection.
- Pair the language menu with the Light, Dark, and System control on the login page so
  both preferences are available before authentication. Maintain 44 px touch targets
  on mobile.
- Route paths stay unchanged after language selection. The selected locale is a UI
  preference, not tenant data or authorization context.
- Translate platform labels and formatting only. Never translate or transliterate
  vendor names, menu items, ingredient names, customer notes, or user-entered records.
- Format displayed order tokens, prices, quantities, stock values, counts, dates, and
  times with the selected locale's configured numeral system: Devanagari for Marathi
  and Hindi, Gujarati digits for Gujarati, and Latin digits for English.
- Do not localize canonical technical strings such as IDs, credentials, route slugs,
  email addresses, or HEX/RGB/HSL color values. Numeric form controls continue to submit
  canonical numeric values even when surrounding read-only output uses localized digits.
- Never render a dynamic display number with `String(value)` or raw JSX. Use the named
  next-intl formats through `useDashboardFormats`, `useFormatter`, or the server formatter.
- Render translated copy only as ordinary React text or inert text attributes such as
  labels, descriptions, placeholders, and accessible names. Do not use translations as
  URLs, form actions, styles, IDs, or executable attributes.
- Do not use `dangerouslySetInnerHTML`, direct DOM HTML injection, or next-intl raw,
  markup, or rich translation APIs. Translation catalogs must not contain HTML-like tags.
- Allow translated copy to wrap naturally; do not set fixed text widths based on English.
- Marathi must be reviewed first on phone-sized order and kitchen workflows. Hindi and
  Gujarati remain draft-quality until native reviewers approve their terminology.

## Glass Surfaces

Approved class: `glass-surface` in `src/app/globals.css`.

The recipe uses:

- A translucent neutral base.
- A linear gradient mixed directly from `--vendor-brand`.
- A normal border tinted toward the vendor accent.
- A light inset top edge and subtle inset lower edge.
- A restrained exterior shadow.
- No `backdrop-filter`, `backdrop-blur`, or blurred content.

Approved surfaces:

- shadcn Card.
- shadcn Sheet and Drawer content.
- Desktop top bar.
- Mobile navigation bar.

Do not nest glass cards. Do not add glass to tables, inputs, every row, page backgrounds,
or ordinary content wrappers. Translucency must not reduce text contrast.

Mobile navigation uses the approved `mobile-navigation-fade` treatment behind its
fixed glass bar. It starts with an opaque 8% vendor tint at the screen bottom and
fades vertically to transparent without blur. The fade layer does not receive
pointer events; navigation controls remain the interactive surface.

## Color Tokens

- Define shared colors only in `src/app/globals.css`.
- Use semantic tokens such as `primary`, `muted`, `border`, `card`, and `vendor-brand`.
- Never hard-code a vendor color in a component.
- Default Buttons use `primary`; vendor layouts override `primary` at runtime.
- Destructive actions remain `destructive`, never vendor accent.
- Status color must keep its operational meaning and must not become vendor-themed.
- Active order states use one shared palette in Queue and Kitchen: `status-paid` is
  muted blue, `status-preparing` is muted amber/orange, and `status-ready` is muted
  green. Apply these colors to compact Badge text, a small status dot, a restrained
  translucent fill, and a quiet border; do not flood the order card, metric card, or
  workspace background.
- `--platform-background` is the neutral light/dark foundation.
- A vendor workspace mixes `--vendor-brand` into `--platform-background` at 2.5%,
  exactly half the leading 5% glass-surface tint.

## Light And Dark Modes

- Theme state uses `next-themes` with `attribute="class"`.
- The available settings are Light, Dark, and System; System is the default.
- Theme selection uses the installed shadcn `ToggleGroup` and persists through
  `next-themes` local storage behavior.
- Keep both `:root` and `.dark` semantic tokens complete in `src/app/globals.css`.
- Components consume semantic tokens and dark variants; do not branch on theme in
  feature code or add page-specific hard-coded dark colors.
- Vendor accent, readable accent foreground, heading font, and glass tint must work
  in both modes.
- Disable theme-change transitions to avoid distracting full-workspace color animation.
- Keep `suppressHydrationWarning` on the root `html` element because `next-themes`
  updates its class before hydration.

## Accessibility Preferences

- Use the shadcn/Radix Slider for text size and text weight. Each thumb requires a
  localized accessible name and `aria-valuetext`; a visual value alone is insufficient.
- Text size supports 100% through 200% in 10% steps. Text weight supports Regular,
  Medium, and Strong without flattening the distinction between ordinary, medium, and
  semibold copy.
- The root layout reads the validated `cms_platform_accessibility` cookie and renders
  the matching size, weight, and `data-color-profile` before first paint. Client controls
  update the same root values immediately and persist only this non-sensitive preference.
- Keep accessibility preferences device-local until profile-backed preferences are
  explicitly introduced. Never use this cookie for authorization, tenant selection,
  business rules, or stored record formatting.
- Offer Standard, Color-safe, and High contrast profiles. Color-safe presentation uses
  semantic status/chart tokens designed to remain distinguishable for common color-vision
  differences. Do not apply CSS filters that simulate color blindness or recolor photos,
  logos, vendor artwork, or native color inputs.
- High contrast can override vendor accent tokens. Accessibility takes precedence over
  branding when the two conflict.
- Status components use semantic tokens such as `status-paid`, `status-preparing`,
  `status-ready`, and `destructive`.
  Do not encode state only with hue: retain visible text and add icons, shapes, patterns,
  or direct labels where a visualization otherwise depends on color.
- Describe these settings as improving possible readability, not guaranteeing access or
  WCAG conformance. Browser zoom, operating-system preferences, assistive technology,
  and user testing remain part of the accessibility strategy.

## Layout And Responsive Rules

- Mobile is a purpose-built interface, not a compressed desktop layout.
- Fixed controls must have stable dimensions and safe-area spacing.
- Reserve `pb-28` on mobile dashboard content so the fixed navigation does not cover
  the final actions or cards.
- Position the fixed navigation above `env(safe-area-inset-bottom, 0px)`.
- Avoid horizontal tables on phone when a compact item/list representation is practical.
- Text must wrap or truncate intentionally and must never overlap controls.
- Cards use a maximum radius of the installed shadcn preset unless a primitive requires otherwise.

## Shell Alignment And Stacking

Desktop header geometry:

- Sidebar header height: 72 px (`h-18`).
- Top bar height: 72 px (`h-18`).
- Each header owns its bottom border inside the same fixed-height box.
- Do not place a separate separator below either header; it changes the seam position.
- The expanded vendor identity control reserves three compact lines for platform,
  vendor, and location. The collapsed state remains a centered 32 px vendor mark.

Stacking scale:

- Main content: normal document flow.
- Desktop sidebar: `z-20`.
- Sticky desktop top bar: `z-30`.
- Mobile navigation: `z-40`.
- shadcn overlay primitives: their built-in `z-50`.

Do not add arbitrary z-index values. Do not override overlay z-index in feature components.

## Interaction Rules

- Buttons inside forms declare the correct `type`.
- Client-side interactions must not reload the page or reset scroll unexpectedly.
- Destructive or delay-sensitive actions provide explicit confirmation or Undo.
- Disabled and pending states must remain visible and accessible.
- Touch targets should be at least 44 px for persistent mobile shell controls.
- Hover is supplementary; every action must work by tap and keyboard.

## Verification Checklist

- Run `npm run lint`.
- Run `npx tsc --noEmit`.
- Test one desktop and one phone viewport.
- Test the actual Android Firefox path when mobile shell behavior changes.
- Verify expanded and collapsed sidebar alignment.
- Verify selected accent on primary buttons, readable foreground, and glass tint.
- Verify Light, Dark, and System selection and the half-strength page tint.
- Verify the 100%, 150%, and 200% text-size settings at desktop and phone widths without
  hidden controls, horizontal page overflow, or unreachable fixed navigation.
- Verify Regular, Medium, and Strong text weights with Latin, Devanagari, and Gujarati
  fonts, including that headings remain visually distinct from body copy.
- Verify Standard, Color-safe, and High contrast profiles in light and dark modes. Check
  text contrast, focus rings, status labels, charts, and vendor-workspace overrides.
- Operate both sliders with keyboard arrows and touch; confirm their localized accessible
  names/value text and that an invalid preference cookie returns to the defaults.
- Test 200% browser zoom separately; the in-app text-size control does not replace it.
- Verify Sans and Serif heading settings after a reload.
- Verify all four locale choices, cookie persistence, browser-language negotiation,
  Marathi fallback, and unchanged route paths.
- Verify representative integer, quantity, currency, token, date, time, and plural-count
  output in each locale's expected numeral system.
- Run the enforced translation security check and obtain native review for destructive,
  payment, role, permission, and error wording.
- Check representative Marathi, Hindi, and Gujarati screens for clipping and unintended
  Latin-font fallback; complete the Marathi native review before pilot release.
- Search `src/` for prohibited blur usage and unintended raw colors.
- Update `docs/live-development-log.txt` before handing work to another model.
