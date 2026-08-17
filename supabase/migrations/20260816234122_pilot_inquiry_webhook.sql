-- Database Webhooks are implemented with pg_net triggers. Keep the webhook
-- authentication secret in Supabase Vault rather than in this migration.
create extension if not exists pg_net;

create schema if not exists private;

create or replace function private.enqueue_pilot_inquiry_notification()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, vault, net
as $function$
declare
  webhook_secret text;
begin
  select decrypted_secret
    into webhook_secret
    from vault.decrypted_secrets
   where name = 'pilot_inquiry_webhook_secret';

  if webhook_secret is null then
    raise warning 'KOT Platform pilot inquiry webhook secret is not configured';
    return new;
  end if;

  perform net.http_post(
    url := 'https://bayrnypobftotxnuysom.supabase.co/functions/v1/notify-pilot-inquiry',
    body := jsonb_build_object(
      'type', 'INSERT',
      'schema', 'public',
      'table', 'pilot_inquiries',
      'record', to_jsonb(new),
      'old_record', null
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-pilot-inquiry-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 15_000
  );

  return new;
end;
$function$;

revoke all on function private.enqueue_pilot_inquiry_notification()
  from public, anon, authenticated;

drop trigger if exists pilot_inquiries_notify on public.pilot_inquiries;
create trigger pilot_inquiries_notify
after insert on public.pilot_inquiries
for each row
execute function private.enqueue_pilot_inquiry_notification();
