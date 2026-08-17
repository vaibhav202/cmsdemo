-- Atomic counter checkout for the cart flow.
-- Demo vendors may use the anonymous path; production vendors require an active
-- authenticated owner, admin, manager, or cashier membership.

alter table public.orders
  add column if not exists payment_mode text,
  add column if not exists note text,
  add column if not exists idempotency_key uuid;

create unique index if not exists orders_vendor_id_token_no_key
  on public.orders (vendor_id, token_no);

create unique index if not exists orders_vendor_id_idempotency_key_key
  on public.orders (vendor_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists private.vendor_order_counters (
  vendor_id uuid primary key references public.vendors(id) on delete cascade,
  last_token_no integer not null check (last_token_no >= 0)
);

insert into private.vendor_order_counters (vendor_id, last_token_no)
select
  vendors.id,
  coalesce(max(orders.token_no), 100)::integer
from public.vendors
left join public.orders
  on orders.vendor_id = vendors.id
group by vendors.id
on conflict (vendor_id) do nothing;

revoke all on private.vendor_order_counters from public, anon, authenticated;

-- The public invoker RPCs call these narrowly granted private checks for demo and
-- authenticated flows. Schema usage does not grant access to private tables.
grant usage on schema private to anon;

create or replace function private.can_manage_counter_orders(
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
    from public.vendors
    where vendors.id = p_vendor_id
      and vendors.status = 'active'
      and vendors.is_demo = true
      and (select auth.uid()) is null
  )
  or exists (
    select 1
    from public.vendor_members
    where vendor_members.vendor_id = p_vendor_id
      and vendor_members.user_id = (select auth.uid())
      and vendor_members.status = 'active'
      and vendor_members.role in ('owner', 'admin', 'manager', 'cashier')
  );
$$;

create or replace function private.allocate_counter_token(
  p_vendor_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token_no integer;
begin
  if not private.can_manage_counter_orders(p_vendor_id) then
    raise exception using
      errcode = '42501',
      message = 'The current member cannot create orders for this vendor.';
  end if;

  insert into private.vendor_order_counters (vendor_id, last_token_no)
  select p_vendor_id, coalesce(max(orders.token_no), 100)::integer
  from public.orders
  where orders.vendor_id = p_vendor_id
  on conflict (vendor_id) do nothing;

  update private.vendor_order_counters
  set last_token_no = last_token_no + 1
  where vendor_id = p_vendor_id
  returning last_token_no into v_token_no;

  if v_token_no is null then
    raise exception using
      errcode = 'P0002',
      message = 'The vendor order counter could not be allocated.';
  end if;

  return v_token_no;
end;
$$;

revoke execute on function private.can_manage_counter_orders(uuid) from public;
revoke execute on function private.allocate_counter_token(uuid) from public;
grant execute on function private.can_manage_counter_orders(uuid) to anon, authenticated;
grant execute on function private.allocate_counter_token(uuid) to anon, authenticated;

create or replace function public.create_counter_order(
  p_vendor_id uuid,
  p_customer_label text,
  p_payment_mode text,
  p_note text,
  p_lines jsonb,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_line jsonb;
  v_menu_item_id uuid;
  v_quantity integer;
  v_item public.menu_items%rowtype;
  v_order public.orders%rowtype;
  v_token_no integer;
  v_total numeric := 0;
  v_line_count integer;
  v_payment_status text;
  v_customer_label text := coalesce(nullif(trim(p_customer_label), ''), 'Counter');
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_existing public.orders%rowtype;
begin
  if not private.can_manage_counter_orders(p_vendor_id) then
    raise exception using
      errcode = '42501',
      message = 'The current member cannot create orders for this vendor.';
  end if;

  if length(v_customer_label) > 80 then
    raise exception using
      errcode = '22023',
      message = 'Customer label must be 80 characters or fewer.';
  end if;

  if v_note is not null and length(v_note) > 240 then
    raise exception using
      errcode = '22023',
      message = 'Order note must be 240 characters or fewer.';
  end if;

  if p_payment_mode not in ('cash', 'upi', 'card', 'pending') then
    raise exception using
      errcode = '22023',
      message = 'Unsupported payment mode.';
  end if;

  if jsonb_typeof(p_lines) <> 'array' then
    raise exception using
      errcode = '22023',
      message = 'Order lines must be an array.';
  end if;

  v_line_count := jsonb_array_length(p_lines);

  if v_line_count < 1 or v_line_count > 40 then
    raise exception using
      errcode = '22023',
      message = 'An order must contain between 1 and 40 lines.';
  end if;

  if exists (
    select 1
    from (
      select value ->> 'menuItemId' as menu_item_id
      from jsonb_array_elements(p_lines)
    ) as requested_lines
    group by requested_lines.menu_item_id
    having count(*) > 1
  ) then
    raise exception using
      errcode = '22023',
      message = 'Each menu item may appear only once in the cart.';
  end if;

  if p_idempotency_key is not null then
    select *
    into v_existing
    from public.orders
    where orders.vendor_id = p_vendor_id
      and orders.idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'createdAt', v_existing.created_at,
        'id', v_existing.id,
        'tokenNo', v_existing.token_no,
        'total', v_existing.total
      );
    end if;
  end if;

  v_token_no := private.allocate_counter_token(p_vendor_id);
  v_payment_status := case
    when p_payment_mode = 'pending' then 'pending'
    else 'paid'
  end;

  insert into public.orders (
    vendor_id,
    token_no,
    customer_label,
    status,
    payment_status,
    payment_mode,
    source,
    note,
    total,
    idempotency_key
  )
  values (
    p_vendor_id,
    v_token_no,
    v_customer_label,
    'paid',
    v_payment_status,
    p_payment_mode,
    'counter',
    v_note,
    0,
    p_idempotency_key
  )
  returning * into v_order;

  for v_line in
    select value
    from jsonb_array_elements(p_lines)
  loop
    begin
      v_menu_item_id := (v_line ->> 'menuItemId')::uuid;
      v_quantity := (v_line ->> 'quantity')::integer;
    exception
      when invalid_text_representation then
        raise exception using
          errcode = '22023',
          message = 'A cart line is invalid.';
    end;

    if v_quantity is null or v_quantity < 1 or v_quantity > 20 then
      raise exception using
        errcode = '22023',
        message = 'Each item quantity must be between 1 and 20.';
    end if;

    select *
    into v_item
    from public.menu_items
    where menu_items.id = v_menu_item_id
      and menu_items.vendor_id = p_vendor_id
      and menu_items.in_stock = true;

    if not found then
      raise exception using
        errcode = 'P0002',
        message = 'A cart item is unavailable.';
    end if;

    insert into public.order_items (
      order_id,
      menu_item_id,
      item_name_snapshot,
      quantity,
      price_at_time
    )
    values (
      v_order.id,
      v_item.id,
      v_item.name,
      v_quantity,
      v_item.price
    );

    v_total := v_total + (v_item.price * v_quantity);
  end loop;

  update public.orders
  set total = v_total,
      updated_at = now()
  where id = v_order.id
    and vendor_id = p_vendor_id;

  return jsonb_build_object(
    'createdAt', v_order.created_at,
    'id', v_order.id,
    'tokenNo', v_order.token_no,
    'total', v_total
  );
end;
$$;

create or replace function public.cancel_counter_order(
  p_vendor_id uuid,
  p_order_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if not private.can_manage_counter_orders(p_vendor_id) then
    raise exception using
      errcode = '42501',
      message = 'The current member cannot cancel orders for this vendor.';
  end if;

  update public.orders
  set status = 'cancelled',
      updated_at = now()
  where id = p_order_id
    and vendor_id = p_vendor_id
    and status = 'paid'
  returning * into v_order;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Only a newly paid order can be cancelled.';
  end if;

  return jsonb_build_object(
    'id', v_order.id,
    'status', v_order.status,
    'tokenNo', v_order.token_no
  );
end;
$$;

revoke execute on function public.create_counter_order(uuid, text, text, text, jsonb, uuid) from public;
revoke execute on function public.cancel_counter_order(uuid, uuid) from public;
grant execute on function public.create_counter_order(uuid, text, text, text, jsonb, uuid) to anon, authenticated;
grant execute on function public.cancel_counter_order(uuid, uuid) to anon, authenticated;

-- Demo-only anonymous access. Production authenticated policies remain the
-- authorization boundary for non-demo vendors.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists orders_demo_select on public.orders;
create policy orders_demo_select
on public.orders
for select
to anon
using (
  exists (
    select 1
    from public.vendors
    where vendors.id = orders.vendor_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
);

drop policy if exists orders_demo_insert on public.orders;
create policy orders_demo_insert
on public.orders
for insert
to anon
with check (
  exists (
    select 1
    from public.vendors
    where vendors.id = orders.vendor_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
);

drop policy if exists orders_demo_update on public.orders;
create policy orders_demo_update
on public.orders
for update
to anon
using (
  exists (
    select 1
    from public.vendors
    where vendors.id = orders.vendor_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.vendors
    where vendors.id = orders.vendor_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
);

drop policy if exists order_items_demo_select on public.order_items;
create policy order_items_demo_select
on public.order_items
for select
to anon
using (
  exists (
    select 1
    from public.orders
    join public.vendors on vendors.id = orders.vendor_id
    where orders.id = order_items.order_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
);

drop policy if exists order_items_demo_insert on public.order_items;
create policy order_items_demo_insert
on public.order_items
for insert
to anon
with check (
  exists (
    select 1
    from public.orders
    join public.vendors on vendors.id = orders.vendor_id
    where orders.id = order_items.order_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
);
