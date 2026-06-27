---
name: canteen-saas-architect
description: Use for architecting, planning, reviewing, or implementing the canteen/cafe B2B SaaS platform. Applies to NextJS, Vercel, Supabase, RLS, multi-tenant vendor data, role-based dashboards, Storage/image normalization, mobile-first PWA workflows, agentic development, roadmap planning, and launch-readiness decisions.
---

# Canteen SaaS Architect Skill Spec

## Purpose

Guide an AI agent working on the canteen/cafe management SaaS so it stays aligned with:

- Subscription-only B2B business model.
- Pune-first local rollout.
- NextJS + Vercel + Supabase architecture.
- Multi-tenant vendor isolation using `vendor_id`.
- Role-based access through `vendor_members`.
- RLS-first security.
- Mobile-first PWA before Play Store.
- Agentic workflow with manual testing gates.

## Canonical Stack

- App framework: NextJS App Router.
- Hosting: Vercel.
- Language: TypeScript.
- UI: TailwindCSS + Shadcn UI.
- Backend: NextJS route handlers/server actions.
- Auth: Supabase Auth.
- Database: Supabase PostgreSQL.
- Security: Supabase RLS.
- Storage: Supabase Storage.
- Realtime: Supabase Realtime.
- Image processing: Sharp.
- Validation: Zod + React Hook Form.
- Mobile path: PWA first, Capacitor later.

## Non-Negotiable Rules

- Use `vendor_id` as the tenant boundary.
- Use `vendor_members` for user-role membership.
- Do not use `vendor_membership_id` as the top-level tenant key.
- Do not rely on frontend route guards as security.
- Do not bypass RLS in user-facing flows.
- Do not expose service role keys in browser/client code.
- Do not add payment marketplace behavior without explicit approval.
- Do not add ads, hidden monetization, lending, credit scoring, or food marketplace positioning.
- Do not build khatabook, inventory suggestions, reports, or Play Store packaging before the security foundation.
- Update documentation when architecture, schema, permissions, or launch assumptions change.

## Reference Loading Guide

Read only what is needed:

- For product/architecture decisions:
  - `reports/platform-architecture-report.txt`

- For SDLC, gates, agent workflow, and roadmap:
  - `reports/sdlc-agentic-roadmap.txt`

- For scope control:
  - `mvp-scope.txt`

- For auth, roles, route access, and RLS:
  - `role-permission-matrix.txt`

- For visual structure:
  - `diagrams/hq-text/*.png`

## Default Workflow

1. Identify task type:
   - architecture
   - schema/RLS
   - frontend route/UI
   - backend/server action
   - upload/storage
   - roadmap/documentation

2. Read relevant reference files.

3. Produce a short plan:
   - goal
   - assumptions
   - files likely affected
   - data/schema impact
   - permission/RLS impact
   - tests/manual checks

4. Implement the smallest safe slice.

5. Verify:
   - build
   - typecheck/lint/tests if available
   - manual test checklist when needed

6. Report:
   - what changed
   - what was verified
   - what remains risky or untested

## Required Output Contract For Architect Work

Architect agents should output:

- Summary
- Assumptions
- Proposed architecture
- Data model impact
- RLS/security impact
- Role/access impact
- Files/directories affected
- Manual tests
- Risks
- Stop conditions
- Acceptance criteria

## Stop And Ask Before

- Changing the tenant model.
- Removing `vendor_id` from tenant-owned tables.
- Bypassing RLS.
- Adding service role access to user-facing flows.
- Changing business model.
- Adding payments, settlement, or marketplace behavior.
- Adding customer login requirements.
- Adding Play Store/Capacitor work before PWA is stable.
- Large rewrites unrelated to the task.
- Deleting existing documentation.

## Completion Standard

A task is not complete unless:

- It matches the MVP scope.
- It preserves tenant isolation.
- It respects the role matrix.
- It has an explicit verification story.
- It documents any architecture decision that changed.
