-- Public acquisition inquiries are intentionally separate from tenant data.
-- Anonymous callers may insert a validated request, but cannot read or mutate it.

create table if not exists public.pilot_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  business_name text not null,
  phone text,
  city text,
  message text,
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  constraint pilot_inquiries_name_length
    check (char_length(btrim(name)) between 2 and 80),
  constraint pilot_inquiries_email_format
    check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint pilot_inquiries_email_length
    check (char_length(btrim(email)) between 5 and 254),
  constraint pilot_inquiries_business_name_length
    check (char_length(btrim(business_name)) between 2 and 120),
  constraint pilot_inquiries_phone_length
    check (phone is null or char_length(btrim(phone)) between 7 and 30),
  constraint pilot_inquiries_city_length
    check (city is null or char_length(btrim(city)) between 2 and 80),
  constraint pilot_inquiries_message_length
    check (message is null or char_length(btrim(message)) <= 1000)
);

alter table public.pilot_inquiries enable row level security;

revoke all on public.pilot_inquiries from public, anon, authenticated;
grant insert on public.pilot_inquiries to anon;

drop policy if exists pilot_inquiries_anon_insert on public.pilot_inquiries;
create policy pilot_inquiries_anon_insert
on public.pilot_inquiries
for insert
to anon
with check (
  consent = true
  and char_length(btrim(name)) between 2 and 80
  and char_length(btrim(email)) between 5 and 254
  and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  and char_length(btrim(business_name)) between 2 and 120
  and (phone is null or char_length(btrim(phone)) between 7 and 30)
  and (city is null or char_length(btrim(city)) between 2 and 80)
  and (message is null or char_length(btrim(message)) <= 1000)
);
