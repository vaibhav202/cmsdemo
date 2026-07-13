-- Temporary preview access for active presentation workspaces.
-- Replace these anon policies with authenticated membership policies before pilot use.

create policy stock_items_demo_insert
on public.stock_items
for insert
to anon
with check (
  exists (
    select 1
    from public.vendors
    where vendors.id = stock_items.vendor_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
);

create policy stock_log_demo_insert
on public.stock_log
for insert
to anon
with check (
  exists (
    select 1
    from public.vendors
    where vendors.id = stock_log.vendor_id
      and vendors.is_demo = true
      and vendors.status = 'active'
  )
  and exists (
    select 1
    from public.stock_items
    where stock_items.id = stock_log.stock_item_id
      and stock_items.vendor_id = stock_log.vendor_id
  )
);

create or replace function public.create_inventory_ingredient(
  p_vendor_id uuid,
  p_name text,
  p_unit text,
  p_opening_qty numeric,
  p_reorder_level numeric
)
returns public.stock_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item public.stock_items;
begin
  if length(trim(p_name)) < 2 or length(trim(p_name)) > 80 then
    raise exception using
      errcode = '22023',
      message = 'Ingredient name must be between 2 and 80 characters.';
  end if;

  if p_unit not in ('kg', 'g', 'l', 'ml', 'pcs', 'pack') then
    raise exception using
      errcode = '22023',
      message = 'Unsupported stock unit.';
  end if;

  if p_opening_qty < 0 or p_reorder_level < 0 then
    raise exception using
      errcode = '22023',
      message = 'Stock quantities cannot be negative.';
  end if;

  insert into public.stock_items (
    vendor_id,
    name,
    unit,
    current_qty,
    reorder_level
  )
  values (
    p_vendor_id,
    trim(p_name),
    p_unit,
    p_opening_qty,
    p_reorder_level
  )
  returning * into v_item;

  if p_opening_qty > 0 then
    insert into public.stock_log (
      vendor_id,
      stock_item_id,
      quantity_delta,
      reason
    )
    values (
      p_vendor_id,
      v_item.id,
      p_opening_qty,
      'Opening stock'
    );
  end if;

  return v_item;
end;
$$;

create or replace function public.record_inventory_movement(
  p_vendor_id uuid,
  p_stock_item_id uuid,
  p_quantity_delta numeric,
  p_reason text
)
returns public.stock_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item public.stock_items;
begin
  if p_quantity_delta = 0 then
    raise exception using
      errcode = '22023',
      message = 'Stock movement cannot be zero.';
  end if;

  if length(trim(p_reason)) < 3 or length(trim(p_reason)) > 120 then
    raise exception using
      errcode = '22023',
      message = 'Movement reason must be between 3 and 120 characters.';
  end if;

  select *
  into v_item
  from public.stock_items
  where id = p_stock_item_id
    and vendor_id = p_vendor_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Ingredient not found in this workspace.';
  end if;

  if v_item.current_qty + p_quantity_delta < 0 then
    raise exception using
      errcode = '23514',
      message = 'Stock movement would reduce quantity below zero.';
  end if;

  update public.stock_items
  set
    current_qty = current_qty + p_quantity_delta,
    updated_at = now()
  where id = p_stock_item_id
    and vendor_id = p_vendor_id
  returning * into v_item;

  insert into public.stock_log (
    vendor_id,
    stock_item_id,
    quantity_delta,
    reason
  )
  values (
    p_vendor_id,
    p_stock_item_id,
    p_quantity_delta,
    trim(p_reason)
  );

  return v_item;
end;
$$;

revoke execute on function public.create_inventory_ingredient(uuid, text, text, numeric, numeric)
from public;
revoke execute on function public.record_inventory_movement(uuid, uuid, numeric, text)
from public;

grant execute on function public.create_inventory_ingredient(uuid, text, text, numeric, numeric)
to anon, authenticated;
grant execute on function public.record_inventory_movement(uuid, uuid, numeric, text)
to anon, authenticated;
