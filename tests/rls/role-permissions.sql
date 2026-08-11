\set ON_ERROR_STOP on

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(11);

insert into auth.users (id, email)
values
  ('11000000-0000-0000-0000-000000000001', 'rls-owner@example.test'),
  ('11000000-0000-0000-0000-000000000002', 'rls-admin@example.test'),
  ('11000000-0000-0000-0000-000000000003', 'rls-manager@example.test'),
  ('11000000-0000-0000-0000-000000000004', 'rls-cashier@example.test'),
  ('11000000-0000-0000-0000-000000000005', 'rls-disabled@example.test');

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
values (
  '21000000-0000-0000-0000-000000000001',
  'RLS Role Vendor',
  'rls-role-vendor',
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
    '31000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000001',
    'owner',
    'active'
  ),
  (
    '31000000-0000-0000-0000-000000000002',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000002',
    'admin',
    'active'
  ),
  (
    '31000000-0000-0000-0000-000000000003',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000003',
    'manager',
    'active'
  ),
  (
    '31000000-0000-0000-0000-000000000004',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000004',
    'cashier',
    'active'
  ),
  (
    '31000000-0000-0000-0000-000000000005',
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000005',
    'owner',
    'disabled'
  );

set local role authenticated;

set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000001';
select ok(
  private.is_active_vendor_member(
    '21000000-0000-0000-0000-000000000001'
  ),
  'an active owner is an active vendor member'
);
select ok(
  private.can_manage_vendor_billing(
    '21000000-0000-0000-0000-000000000001'
  ),
  'an active owner can read billing state'
);

set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000002';
select ok(
  private.can_manage_vendor_billing(
    '21000000-0000-0000-0000-000000000001'
  ),
  'an active admin can read billing state'
);

set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000003';
select ok(
  private.is_active_vendor_member(
    '21000000-0000-0000-0000-000000000001'
  ),
  'an active manager is an active vendor member'
);
select is(
  private.can_manage_vendor_billing(
    '21000000-0000-0000-0000-000000000001'
  ),
  false,
  'a manager cannot read billing state'
);

set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000004';
select ok(
  private.is_active_vendor_member(
    '21000000-0000-0000-0000-000000000001'
  ),
  'an active cashier is an active vendor member'
);
select is(
  private.can_manage_vendor_billing(
    '21000000-0000-0000-0000-000000000001'
  ),
  false,
  'a cashier cannot read billing state'
);

set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000005';
select is(
  private.is_active_vendor_member(
    '21000000-0000-0000-0000-000000000001'
  ),
  false,
  'a disabled owner is not an active vendor member'
);
select is(
  private.can_manage_vendor_billing(
    '21000000-0000-0000-0000-000000000001'
  ),
  false,
  'a disabled owner cannot read billing state'
);

set local request.jwt.claim.sub = '11000000-0000-0000-0000-000000000001';
select throws_ok(
  $$
    insert into public.vendor_subscriptions (
      vendor_id,
      plan_id,
      status
    )
    select
      '21000000-0000-0000-0000-000000000001',
      subscription_plans.id,
      'active'
    from public.subscription_plans
    where code = 'basic'
  $$,
  '42501',
  null,
  'a vendor owner cannot write trusted subscription state through the Data API'
);

set local request.jwt.claim.sub = '11999999-0000-0000-0000-000000000099';
select is(
  private.is_active_vendor_member(
    '21000000-0000-0000-0000-000000000001'
  ),
  false,
  'a non-member has no vendor access'
);

reset role;

select * from finish();
rollback;
