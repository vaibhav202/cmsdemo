# 0005 — Development media previews stay local

- Status: Accepted
- Date: 2026-08-09

## Context

The preview workspace still uses deterministic mock credentials, while the
production media endpoint requires a Supabase Auth session and an active vendor
membership. Enabling that endpoint for preview cookies would turn a test-only
identity into a production authorization path.

## Decision

The development workspace exposes an explicit `demo` media mode. It accepts the
same browser-selected JPEG, PNG, and WebP inputs, displays the selected image,
and stores a bounded browser-local data URL so the preview remains visible after
the control is reopened. Demo mode never calls the media API or Supabase Storage.

Production uses the existing authenticated media endpoint and Sharp WebP
normalization only after Supabase Auth, membership authorization, and the media
Storage/database migration are available.

## Consequences

- Owners can verify the upload-to-display interaction without a remote database.
- Demo media is device-local and must never be described as a production upload.
- Production Storage policies and tenant authorization remain unchanged and are
  still required before real assets can be persisted.
