create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  property_type text not null check (property_type in ('land', 'apartment', 'house')),
  price numeric not null check (price >= 0),
  location text not null,
  features text[] not null default '{}',
  status text not null default 'available' check (status in ('available', 'sold')),
  views_count integer not null default 0 check (views_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null default '',
  broker_name text not null default 'Field & Found',
  display_email text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default ''
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Public can read properties" on public.properties;
create policy "Public can read properties"
  on public.properties for select to anon, authenticated using (true);

drop policy if exists "Authenticated admins manage properties" on public.properties;
create policy "Authenticated admins manage properties"
  on public.properties for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read property images" on public.property_images;
create policy "Public can read property images"
  on public.property_images for select to anon, authenticated using (true);

drop policy if exists "Authenticated admins manage property images" on public.property_images;
create policy "Authenticated admins manage property images"
  on public.property_images for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "Authenticated admins manage site settings" on public.site_settings;
create policy "Authenticated admins manage site settings"
  on public.site_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create or replace function public.increment_property_views(property_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.properties
  set views_count = views_count + 1
  where id = property_id;
$$;

revoke all on function public.increment_property_views(uuid) from public;
grant execute on function public.increment_property_views(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view property images" on storage.objects;
create policy "Public can view property images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated admins upload property images" on storage.objects;
create policy "Authenticated admins upload property images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images' and (select public.is_admin()));

drop policy if exists "Authenticated admins update property images" on storage.objects;
create policy "Authenticated admins update property images"
  on storage.objects for update to authenticated
  using (bucket_id = 'property-images' and (select public.is_admin()))
  with check (bucket_id = 'property-images' and (select public.is_admin()));

drop policy if exists "Authenticated admins delete property images" on storage.objects;
create policy "Authenticated admins delete property images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-images' and (select public.is_admin()));
