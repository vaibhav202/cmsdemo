\set ON_ERROR_STOP on

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(8);

select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.vendor_subscriptions'::regclass
  ),
  'vendor_subscriptions has RLS enabled'
);

select ok(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.vendor_entitlements'::regclass
  ),
  'vendor_entitlements has RLS enabled'
);

insert into auth.users (id, email)
values
  ('10000000-0000-0000-0000-000000000001', 'rls-owner-a@example.test'),
  ('10000000-0000-0000-0000-000000000002', 'rls-owner-b@example.test');

insert into public.vendors (
  id,
  name,
  slug,
  plan,
  status,
  location,
  brand_color,
  heading_font
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'RLS Vendor A',
    'rls-vendor-a',
    'Basic',
    'active',
    'Test',
    '#2563eb',
    'sans'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'RLS Vendor B',
    'rls-vendor-b',
    'Basic',
    'active',
    'Test',
    '#2563eb',
    'sans'
  );

insert into public.vendor_members (
  id,
  vendor_id,
  user_id,
  role,
  status
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'owner',
    'active'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'owner',
    'active'
  );

insert into public.vendor_subscriptions (
  id,
  vendor_id,
  plan_id,
  status,
  current_period_start,
  current_period_end
)
select
  subscription_id,
  vendor_id,
  subscription_plans.id,
  'active',
  now() - interval '1 day',
  now() + interval '30 days'
from (
  values
    (
      '40000000-0000-0000-0000-000000000001'::uuid,
      '20000000-0000-0000-0000-000000000001'::uuid
    ),
    (
      '40000000-0000-0000-0000-000000000002'::uuid,
      '20000000-0000-0000-0000-000000000002'::uuid
    )
) as fixtures(subscription_id, vendor_id)
cross join public.subscription_plans
where subscription_plans.code = 'basic';

insert into public.vendor_entitlements (
  id,
  vendor_id,
  feature_id,
  source,
  subscription_id
)
select
  entitlement_id,
  vendor_id,
  features.id,
  'subscription',
  subscription_id
from (
  values
    (
      '50000000-0000-0000-0000-000000000001'::uuid,
      '20000000-0000-0000-0000-000000000001'::uuid,
      '40000000-0000-0000-0000-000000000001'::uuid
    ),
    (
      '50000000-0000-0000-0000-000000000002'::uuid,
      '20000000-0000-0000-0000-000000000002'::uuid,
      '40000000-0000-0000-0000-000000000002'::uuid
    )
) as fixtures(entitlement_id, vendor_id, subscription_id)
cross join public.features
where features.key = 'orders.manage';

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';

select results_eq(
  $$
    select vendor_id
    from public.vendor_subscriptions
    order by vendor_id
  $$,
  $$
    values ('20000000-0000-0000-0000-000000000001'::uuid)
  $$,
  'an owner sees subscriptions for their vendor only'
);

select results_eq(
  $$
    select vendor_id
    from public.vendor_entitlements
    order by vendor_id
  $$,
  $$
    values ('20000000-0000-0000-0000-000000000001'::uuid)
  $$,
  'an active member sees entitlements for their vendor only'
);

select is(
  (
    select count(*)
    from public.vendor_subscriptions
    where vendor_id = '20000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'a vendor A owner cannot read vendor B subscriptions'
);

select is(
  (
    select count(*)
    from public.vendor_entitlements
    where vendor_id = '20000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'a vendor A member cannot read vendor B entitlements'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select results_eq(
  $$
    select vendor_id
    from public.vendor_subscriptions
    order by vendor_id
  $$,
  $$
    values ('20000000-0000-0000-0000-000000000002'::uuid)
  $$,
  'switching the JWT subject switches the visible subscription tenant'
);

select results_eq(
  $$
    select vendor_id
    from public.vendor_entitlements
    order by vendor_id
  $$,
  $$
    values ('20000000-0000-0000-0000-000000000002'::uuid)
  $$,
  'switching the JWT subject switches the visible entitlement tenant'
);

reset role;

select * from finish();
rollback;

