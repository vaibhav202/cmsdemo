-- The counter is accessed only by the narrowly granted security-definer
-- allocation function. RLS provides defense in depth if table privileges change.
alter table private.vendor_order_counters enable row level security;
