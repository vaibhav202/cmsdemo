-- Subscription and entitlement foundation.
--
-- Plans describe commercial packages.
-- Features describe stable platform capabilities.
-- Plan features are reusable package templates.
-- Vendor entitlements are the effective vendor-specific grants.
-- Membership roles remain a separate authorization boundary.

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status text not null default 'active',
  billing_provider_product_id text,
  created_at timestamptz not null default now(),
  constraint subscription_plans_code_check
    check (code ~ '^[a-z][a-z0-9_]{1,49}$'),
  constraint subscription_plans_name_check
    check (char_length(btrim(name)) between 2 and 80),
  constraint subscription_plans_status_check
    check (status in ('active', 'inactive', 'archived'))
);

create unique index subscription_plans_provider_product_key
  on public.subscription_plans (billing_provider_product_id)
  where billing_provider_product_id is not null;

create table public.features (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text not null,
  module text not null,
  status text not null default 'active',
  constraint features_key_check
    check (key ~ '^[a-z][a-z0-9_.]{2,79}$'),
  constraint features_name_check
    check (char_length(btrim(name)) between 2 and 100),
  constraint features_description_check
    check (char_length(btrim(description)) between 2 and 500),
  constraint features_module_check
    check (module ~ '^[a-z][a-z0-9_]{1,49}$'),
  constraint features_status_check
    check (status in ('active', 'inactive', 'archived'))
);

create index features_module_status_idx
  on public.features (module, status);

create table public.plan_features (
  plan_id uuid not null
    references public.subscription_plans(id) on delete cascade,
  feature_id uuid not null
    references public.features(id) on delete cascade,
  limit_value bigint,
  configuration jsonb not null default '{}'::jsonb,
  primary key (plan_id, feature_id),
  constraint plan_features_limit_value_check
    check (limit_value is null or limit_value >= 0),
  constraint plan_features_configuration_check
    check (jsonb_typeof(configuration) = 'object')
);

create index plan_features_feature_id_idx
  on public.plan_features (feature_id);

create table public.vendor_subscriptions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null
    references public.vendors(id) on delete cascade,
  plan_id uuid not null
    references public.subscription_plans(id) on delete restrict,
  provider_customer_id text,
  provider_subscription_id text,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendor_subscriptions_status_check
    check (
      status in (
        'incomplete',
        'trialing',
        'active',
        'past_due',
        'paused',
        'canceled',
        'expired'
      )
    ),
  constraint vendor_subscriptions_period_check
    check (
      current_period_start is null
      or current_period_end is null
      or current_period_end > current_period_start
    ),
  unique (id, vendor_id)
);

create unique index vendor_subscriptions_provider_subscription_key
  on public.vendor_subscriptions (provider_subscription_id)
  where provider_subscription_id is not null;

create unique index vendor_subscriptions_one_current_idx
  on public.vendor_subscriptions (vendor_id)
  where status in (
    'incomplete',
    'trialing',
    'active',
    'past_due',
    'paused'
  );

create index vendor_subscriptions_vendor_status_period_idx
  on public.vendor_subscriptions (
    vendor_id,
    status,
    current_period_end
  );

create index vendor_subscriptions_plan_id_idx
  on public.vendor_subscriptions (plan_id);

create index vendor_subscriptions_provider_customer_idx
  on public.vendor_subscriptions (provider_customer_id)
  where provider_customer_id is not null;

create table public.vendor_entitlements (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null
    references public.vendors(id) on delete cascade,
  feature_id uuid not null
    references public.features(id) on delete restrict,
  source text not null,
  enabled boolean not null default true,
  limit_value bigint,
  starts_at timestamptz,
  ends_at timestamptz,
  subscription_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  constraint vendor_entitlements_limit_value_check
    check (limit_value is null or limit_value >= 0),
  constraint vendor_entitlements_source_check
    check (source in ('subscription', 'manual', 'promotion', 'system')),
  constraint vendor_entitlements_source_subscription_check
    check (
      (source = 'subscription' and subscription_id is not null)
      or (source <> 'subscription' and subscription_id is null)
    ),
  constraint vendor_entitlements_window_check
    check (
      starts_at is null
      or ends_at is null
      or ends_at > starts_at
    ),
  constraint vendor_entitlements_metadata_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint vendor_entitlements_subscription_vendor_fkey
    foreign key (subscription_id, vendor_id)
    references public.vendor_subscriptions(id, vendor_id)
    on delete cascade
);

create unique index vendor_entitlements_subscription_source_key
  on public.vendor_entitlements (
    vendor_id,
    feature_id,
    source,
    subscription_id
  )
  where subscription_id is not null;

create unique index vendor_entitlements_override_source_key
  on public.vendor_entitlements (vendor_id, feature_id, source)
  where subscription_id is null;

create index vendor_entitlements_vendor_feature_window_idx
  on public.vendor_entitlements (
    vendor_id,
    feature_id,
    enabled,
    starts_at,
    ends_at
  );

create index vendor_entitlements_feature_id_idx
  on public.vendor_entitlements (feature_id);

create index vendor_entitlements_subscription_id_idx
  on public.vendor_entitlements (subscription_id)
  where subscription_id is not null;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_active_vendor_member(
  p_vendor_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.vendor_members
    where vendor_members.vendor_id = p_vendor_id
      and vendor_members.user_id = (select auth.uid())
      and vendor_members.status = 'active'
  );
$$;

create or replace function private.can_manage_vendor_billing(
  p_vendor_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.vendor_members
    where vendor_members.vendor_id = p_vendor_id
      and vendor_members.user_id = (select auth.uid())
      and vendor_members.status = 'active'
      and vendor_members.role in ('owner', 'admin')
  );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.is_active_vendor_member(uuid)
  from public, anon;
revoke execute on function private.can_manage_vendor_billing(uuid)
  from public, anon;
revoke execute on function private.set_updated_at()
  from public, anon, authenticated;

grant execute on function private.is_active_vendor_member(uuid)
  to authenticated;
grant execute on function private.can_manage_vendor_billing(uuid)
  to authenticated;

create trigger vendor_subscriptions_set_updated_at
before update on public.vendor_subscriptions
for each row execute function private.set_updated_at();

alter table public.subscription_plans enable row level security;
alter table public.features enable row level security;
alter table public.plan_features enable row level security;
alter table public.vendor_subscriptions enable row level security;
alter table public.vendor_entitlements enable row level security;

create policy subscription_plans_active_select
on public.subscription_plans
for select
to anon, authenticated
using (status = 'active');

create policy features_active_select
on public.features
for select
to anon, authenticated
using (status = 'active');

create policy plan_features_active_catalog_select
on public.plan_features
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.subscription_plans
    where subscription_plans.id = plan_features.plan_id
      and subscription_plans.status = 'active'
  )
  and exists (
    select 1
    from public.features
    where features.id = plan_features.feature_id
      and features.status = 'active'
  )
);

create policy vendor_subscriptions_billing_manager_select
on public.vendor_subscriptions
for select
to authenticated
using ((select private.can_manage_vendor_billing(vendor_id)));

create policy vendor_entitlements_active_member_select
on public.vendor_entitlements
for select
to authenticated
using ((select private.is_active_vendor_member(vendor_id)));

revoke all on table public.subscription_plans from anon, authenticated;
revoke all on table public.features from anon, authenticated;
revoke all on table public.plan_features from anon, authenticated;
revoke all on table public.vendor_subscriptions from anon, authenticated;
revoke all on table public.vendor_entitlements from anon, authenticated;

grant select (
  id,
  code,
  name,
  status,
  created_at
) on public.subscription_plans to anon, authenticated;

grant select on public.features to anon, authenticated;
grant select on public.plan_features to anon, authenticated;

grant select (
  id,
  vendor_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  trial_ends_at,
  created_at,
  updated_at
) on public.vendor_subscriptions to authenticated;

grant select on public.vendor_entitlements to authenticated;

grant select, insert, update, delete
  on public.subscription_plans,
     public.features,
     public.plan_features,
     public.vendor_subscriptions,
     public.vendor_entitlements
  to service_role;

insert into public.subscription_plans (code, name, status)
values
  ('basic', 'Basic', 'active'),
  ('pro', 'Pro', 'active'),
  ('enterprise', 'Enterprise', 'active')
on conflict (code) do update
set
  name = excluded.name,
  status = excluded.status;

insert into public.features (
  key,
  name,
  description,
  module,
  status
)
values
  (
    'orders.manage',
    'Orders',
    'Create and manage vendor orders.',
    'orders',
    'active'
  ),
  (
    'kitchen.manage',
    'Kitchen',
    'View and progress the kitchen workflow.',
    'kitchen',
    'active'
  ),
  (
    'queue.view',
    'Queue',
    'View the live customer-facing order queue.',
    'queue',
    'active'
  ),
  (
    'menu.manage',
    'Menu',
    'Manage menu content and item availability.',
    'menu',
    'active'
  ),
  (
    'inventory.manage',
    'Inventory',
    'Manage stock items and stock movements.',
    'inventory',
    'active'
  ),
  (
    'ledger.manage',
    'Ledger',
    'Manage vendor ledger entries.',
    'ledger',
    'active'
  ),
  (
    'reports.view',
    'Reports',
    'View vendor operational reports.',
    'reports',
    'active'
  )
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  module = excluded.module,
  status = excluded.status;

-- Intentionally do not seed plan_features here. Product ownership must approve
-- which modules and limits belong to Basic, Pro, and Enterprise before
-- entitlement enforcement is enabled.
