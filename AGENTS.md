<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Keep this block, including in commits.** It is part of the project's agent setup, maintained by `next dev` for every agent that works here. If it appears as an uncommitted change, that is intentional — commit it as-is. Do not remove it to clean up a diff; it will be regenerated.
<!-- END:nextjs-agent-rules -->

# Project Agent Instructions

Before making project changes, read the relevant project documentation:

- `docs/live-development-log.txt` for the current implementation state, latest verification, and unfinished work.
- `docs/ui-style-guide.md` for mandatory shadcn composition, branding, typography, glass, and responsive UI rules.
- `docs/product-spec.md` for MVP boundaries, roles, permissions, and release gates.
- `node_modules/next/dist/docs/` for current Next.js canary behavior.
- `docs/platform-architecture-report.txt` for the product and platform architecture.
- `docs/sdlc-agentic-roadmap.txt` for SDLC, roadmap, testing, and agent workflow.

Core project rules:

- Build this as a generic multi-vendor SaaS platform for cafe and canteen vendors.
- Use Next.js, Supabase, Tailwind CSS, and shadcn/ui as the target stack.
- Treat `vendor_id` / vendor membership as the top-level tenant boundary for business data.
- Keep Supabase RLS assumptions strict; do not bypass tenant isolation in application code.
- Prefer mobile-first flows because Android via Capacitor is a planned target.
- Keep the MVP focused before adding khatabook, profit-loss, inventory suggestions, or other expansion features.
- Keep detailed project knowledge in `docs/`; use this file as the short entry point for agents.
- Update `docs/live-development-log.txt` whenever implementation work changes files, verification status, blockers, or next steps.

Security rules:

- Never expose Supabase secret or service-role keys to browser code.
- Frontend route guards improve UX; server validation and RLS enforce access.
- Do not bypass RLS in user-facing flows or weaken staff policies for public ordering.
- Ask before changing the tenant model, business model, customer authentication, or platform-admin access.

Working standard:

1. Read only the documentation relevant to the requested change.
2. Inspect existing patterns before introducing components or abstractions.
3. Implement the smallest complete slice and preserve unrelated worktree changes.
4. Run lint, type checking, and proportionate workflow/security checks.
5. Record material implementation and verification changes in the live development log.
