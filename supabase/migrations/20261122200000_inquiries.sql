-- Dopyty od zákazníkov + zoznam administrátorov, ktorí ich smú vidieť.

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Admin vidí iba svoj vlastný riadok (stačí na overenie "som admin?").
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.inquiries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200 and email like '%@%'),
  phone text check (phone is null or char_length(phone) <= 40),
  service text check (service is null or char_length(service) <= 80),
  location text check (location is null or char_length(location) <= 120),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'novy' check (status in ('novy', 'riesi_sa', 'vybaveny')),
  note text check (note is null or char_length(note) <= 5000)
);

create index inquiries_created_at_idx on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;

-- Verejnosť smie dopyt iba odoslať (vždy so stavom "novy", bez poznámky).
create policy "inquiries_insert_public" on public.inquiries
  for insert to anon, authenticated
  with check (status = 'novy' and note is null);

create policy "inquiries_select_admin" on public.inquiries
  for select to authenticated
  using ((select public.is_admin()));

create policy "inquiries_update_admin" on public.inquiries
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "inquiries_delete_admin" on public.inquiries
  for delete to authenticated
  using ((select public.is_admin()));

-- Verejnosť smie zapisovať len vybrané stĺpce.
revoke insert on public.inquiries from anon, authenticated;
grant insert (name, email, phone, service, location, message) on public.inquiries to anon, authenticated;
grant select, update (status, note), delete on public.inquiries to authenticated;
