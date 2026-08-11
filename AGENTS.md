<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Keep this block, including in commits.** It is part of the project's agent setup, maintained by `next dev` for every agent that works here. If it appears as an uncommitted change, that is intentional — commit it as-is. Do not remove it to clean up a diff; it will be regenerated.
<!-- END:nextjs-agent-rules -->

# Project routing

This file routes humans and agents; durable project knowledge belongs in `docs/`.

1. Read `docs/development-log.md`.
2. Read the relevant domain specification: `docs/product.md`,
   `docs/architecture.md`, `docs/roadmap.md`, or `docs/domains/`.
3. Preserve every invariant in `docs/security.md`.
4. Make the smallest complete change and preserve unrelated work.
5. Run the checks required by `docs/roadmap.md`.
6. Update `docs/development-log.md` and `docs/decisions/` when necessary.

When changing Next.js behavior, read the matching guide under
`node_modules/next/dist/docs/`. When a listed skill applies, read its `SKILL.md`
before acting.

Humans and agents: update this routing file whenever a durable documentation
directory or project skill is added, removed, or renamed.
