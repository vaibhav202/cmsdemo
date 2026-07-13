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
- Body font remains Geist Sans.

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

- Body and control text use `font-sans` (Geist Sans).
- Product and workspace headings use `font-heading`.
- `font-heading` resolves through the runtime `--heading-font-family` token.
- Page `h1` and major section titles may use the selected heading font.
- Compact labels, table text, input text, badges, and long descriptions remain Sans.
- Do not apply serif to dense operational data.
- Do not use viewport-scaled font sizes or negative letter spacing.

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
- Verify Sans and Serif heading settings after a reload.
- Search `src/` for prohibited blur usage and unintended raw colors.
- Update `docs/live-development-log.txt` before handing work to another model.
