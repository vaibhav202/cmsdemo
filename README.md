# CMS Platform

CMS Platform is a mobile-first, multi-vendor operations workspace for cafes,
canteens, and small food-service businesses. It brings counter orders, kitchen
workflow, queue handling, menu availability, inventory, ledger entries, and
reports into one role-aware vendor workspace. The staff interface is Marathi-first
for the Maharashtra pilot, with English, Hindi, and Gujarati also supported. Displayed
numbers, currency, dates, and times use the selected language's numeral system.
Device-local accessibility controls provide text sizing and weight preferences plus
Standard, Color-safe, and High contrast profiles before and after sign-in.

The project is in active development and is not production-ready yet. The current
workspace uses temporary presentation authentication and Supabase preview policies.
Supabase Auth memberships and production RLS verification are required before a
real vendor is onboarded.

## Stack

- Next.js 16 canary with the App Router and TypeScript
- React 19
- shadcn/ui Nova with Radix primitives
- next-intl with locale-aware React Server Components
- Tailwind CSS v4
- Supabase PostgreSQL, Storage, Realtime, and planned Auth memberships
- Vercel for web deployment and Capacitor as the later Android path

## Local Development

Requirements:

- Node.js 20 or newer
- npm
- A Supabase project containing the expected schema

Create `.env.local` from `.env.example` and provide:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a USB-connected Android device, use:

```bash
adb reverse tcp:3000 tcp:3000
```

The same app is then available on the phone at `http://127.0.0.1:3000`.

## Checks

`npm run build` automatically runs the translation security gate first. Run it directly
while editing catalogs for faster feedback:

```bash
npm run i18n:check
npm run lint
npx tsc --noEmit
npm run build
```

Translation catalogs are public assets and must contain plain ICU messages only—never
secrets, HTML, translated URLs, or tenant data. The full rendering boundary, automated
rules, and required GitHub branch protection are documented in the
[localization guide](docs/domains/localization.md#translation-security-contract).

## Architecture

Every tenant-owned business row is scoped by `vendor_id`. A `vendor_members` row
defines which user belongs to a vendor, their role, and whether the membership is
active. Route checks must never replace Supabase RLS.

Main application routes live under:

```text
/app/[vendorSlug]/order
/app/[vendorSlug]/kitchen
/app/[vendorSlug]/queue
/app/[vendorSlug]/control
/app/[vendorSlug]/inventory
/app/[vendorSlug]/ledger
/app/[vendorSlug]/reports
```

## Documentation

- [Product](docs/product.md)
- [Architecture](docs/architecture.md)
- [Security invariants](docs/security.md)
- [Roadmap and required checks](docs/roadmap.md)
- [Current development log](docs/development-log.md)
- [Domain specifications](docs/domains/README.md)
- [Architecture decisions](docs/decisions/)
- [Architecture diagrams](docs/diagrams/README.md)
- [Supabase project notes](supabase/README.md)

Agent entry points are kept intentionally small: `AGENTS.md` is canonical,
`CLAUDE.md` points to it for compatibility, and `.agents/skills/` contains installed
upstream skills rather than project documentation.
