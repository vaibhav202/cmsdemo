-- Keep delivery state separate from public acquisition data. This table is only for
-- the trusted notification worker and is never exposed to browser API roles.
create table if not exists public.pilot_inquiry_notifications (
  inquiry_id uuid primary key
    references public.pilot_inquiries (id)
    on delete cascade,
  status text not null default 'pending',
  attempts integer not null default 0,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pilot_inquiry_notifications_status_check
    check (status in ('pending', 'sending', 'sent', 'failed')),
  constraint pilot_inquiry_notifications_attempts_check
    check (attempts >= 0),
  constraint pilot_inquiry_notifications_error_length_check
    check (last_error is null or char_length(last_error) <= 500)
);

alter table public.pilot_inquiry_notifications enable row level security;

revoke all on public.pilot_inquiry_notifications from public, anon, authenticated;
grant select, insert, update
  on public.pilot_inquiry_notifications
  to service_role;

-- The service role bypasses RLS, but the explicit policy documents the only
-- intended actor and keeps the table safe if that role's bypass behavior changes.
drop policy if exists pilot_inquiry_notifications_service_role
  on public.pilot_inquiry_notifications;
create policy pilot_inquiry_notifications_service_role
on public.pilot_inquiry_notifications
for all
to service_role
using (true)
with check (true);
