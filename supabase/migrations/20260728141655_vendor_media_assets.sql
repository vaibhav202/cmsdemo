-- Production media foundation.
-- Logos are public brand assets. Member avatars remain private personal data.
-- Object writes are immutable and are authorized through active vendor membership.

alter table public.media_assets
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.vendors
  add column if not exists logo_asset_id uuid
  references public.media_assets(id) on delete set null;

alter table public.vendor_members
  add column if not exists avatar_asset_id uuid
  references public.media_assets(id) on delete set null;

alter table public.media_assets
  drop constraint if exists media_assets_purpose_check;

alter table public.media_assets
  add constraint media_assets_purpose_check
  check (
    purpose in (
      'vendor_logo',
      'member_avatar',
      'menu_item_image',
      'logo',
      'staff_avatar',
      'menu_item'
    )
  );

create unique index if not exists media_assets_bucket_object_path_key
  on public.media_assets (bucket, object_path);

create index if not exists vendors_logo_asset_id_idx
  on public.vendors (logo_asset_id);

create index if not exists vendor_members_avatar_asset_id_idx
  on public.vendor_members (avatar_asset_id);

create index if not exists media_assets_created_by_idx
  on public.media_assets (created_by);

create index if not exists media_assets_vendor_id_idx
  on public.media_assets (vendor_id);

create index if not exists vendor_members_vendor_user_status_idx
  on public.vendor_members (vendor_id, user_id, status);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'vendor-public-assets',
    'vendor-public-assets',
    true,
    524288,
    array['image/webp']::text[]
  ),
  (
    'vendor-private-assets',
    'vendor-private-assets',
    false,
    524288,
    array['image/webp']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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

create or replace function private.can_manage_vendor_media(
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
      and vendor_members.role in ('owner', 'admin', 'manager')
  );
$$;

create or replace function private.can_manage_member_avatar(
  p_vendor_id uuid,
  p_member_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.vendor_members as target_member
    where target_member.id = p_member_id
      and target_member.vendor_id = p_vendor_id
      and target_member.status = 'active'
      and (
        target_member.user_id = (select auth.uid())
        or private.can_manage_vendor_media(p_vendor_id)
      )
  );
$$;

revoke execute on function private.is_active_vendor_member(uuid) from public;
revoke execute on function private.can_manage_vendor_media(uuid) from public;
revoke execute on function private.can_manage_member_avatar(uuid, uuid) from public;

grant execute on function private.is_active_vendor_member(uuid) to authenticated;
grant execute on function private.can_manage_vendor_media(uuid) to authenticated;
grant execute on function private.can_manage_member_avatar(uuid, uuid) to authenticated;

create or replace function private.parse_uuid(
  p_value text
)
returns uuid
language plpgsql
immutable
strict
set search_path = ''
as $$
begin
  return p_value::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

revoke execute on function private.parse_uuid(text) from public;
grant execute on function private.parse_uuid(text) to authenticated;

alter table public.media_assets enable row level security;

drop policy if exists media_assets_member_select on public.media_assets;
create policy media_assets_member_select
on public.media_assets
for select
to authenticated
using ((select private.is_active_vendor_member(vendor_id)));

drop policy if exists media_assets_manager_insert on public.media_assets;
create policy media_assets_manager_insert
on public.media_assets
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and (
    (
      purpose = 'vendor_logo'
      and bucket = 'vendor-public-assets'
      and (select private.can_manage_vendor_media(vendor_id))
    )
    or (
      purpose = 'member_avatar'
      and bucket = 'vendor-private-assets'
      and (select private.can_manage_member_avatar(
        vendor_id,
        private.parse_uuid(split_part(object_path, '/', 4))
      ))
    )
  )
);

drop policy if exists media_assets_manager_delete on public.media_assets;
create policy media_assets_manager_delete
on public.media_assets
for delete
to authenticated
using (
  (
    purpose = 'vendor_logo'
    and (select private.can_manage_vendor_media(vendor_id))
  )
  or (
    purpose = 'member_avatar'
    and (select private.can_manage_member_avatar(
      vendor_id,
      private.parse_uuid(split_part(object_path, '/', 4))
    ))
  )
);

drop policy if exists vendor_public_assets_insert on storage.objects;
create policy vendor_public_assets_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vendor-public-assets'
  and (storage.foldername(name))[1] = 'vendors'
  and (storage.foldername(name))[3] = 'logos'
  and storage.extension(name) = 'webp'
  and (select private.can_manage_vendor_media(
    private.parse_uuid((storage.foldername(name))[2])
  ))
);

drop policy if exists vendor_public_assets_delete on storage.objects;
create policy vendor_public_assets_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vendor-public-assets'
  and (storage.foldername(name))[1] = 'vendors'
  and (storage.foldername(name))[3] = 'logos'
  and (select private.can_manage_vendor_media(
    private.parse_uuid((storage.foldername(name))[2])
  ))
);

drop policy if exists vendor_private_assets_select on storage.objects;
create policy vendor_private_assets_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vendor-private-assets'
  and (storage.foldername(name))[1] = 'vendors'
  and (storage.foldername(name))[3] = 'members'
  and (select private.can_manage_member_avatar(
    private.parse_uuid((storage.foldername(name))[2]),
    private.parse_uuid((storage.foldername(name))[4])
  ))
);

drop policy if exists vendor_private_assets_insert on storage.objects;
create policy vendor_private_assets_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vendor-private-assets'
  and (storage.foldername(name))[1] = 'vendors'
  and (storage.foldername(name))[3] = 'members'
  and storage.extension(name) = 'webp'
  and (select private.can_manage_member_avatar(
    private.parse_uuid((storage.foldername(name))[2]),
    private.parse_uuid((storage.foldername(name))[4])
  ))
);

drop policy if exists vendor_private_assets_delete on storage.objects;
create policy vendor_private_assets_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vendor-private-assets'
  and (storage.foldername(name))[1] = 'vendors'
  and (storage.foldername(name))[3] = 'members'
  and (select private.can_manage_member_avatar(
    private.parse_uuid((storage.foldername(name))[2]),
    private.parse_uuid((storage.foldername(name))[4])
  ))
);
