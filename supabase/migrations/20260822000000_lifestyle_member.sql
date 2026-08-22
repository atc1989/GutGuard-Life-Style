-- Gutguard Lifestyle member schema. RLS on; default deny.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  mobile text not null,
  email text,
  sponsor text not null default 'Ate Marites',
  team text not null default 'GenSan',
  card_no text not null,
  phase text not null default 'invited',
  claimed boolean not null default false,
  points integer not null default 0,
  pending integer not null default 0,
  banked integer not null default 0,
  days_left integer not null default 10,
  capsules_per_day integer not null default 2
    check (capsules_per_day between 2 and 3),
  telegram boolean not null default false,
  facebook boolean not null default false,
  notifications boolean not null default true,
  welcome_seen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  handle text,
  stage text not null check (stage in ('registered', 'showed', 'bought')),
  created_at timestamptz not null default now()
);

create table if not exists public.dose_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  morning boolean not null default false,
  midday boolean not null default false,
  dreams boolean not null default false,
  proof_path text,
  unique (user_id, log_date)
);

create table if not exists public.base_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  step_index integer not null check (step_index between 0 and 4),
  done boolean not null default false,
  primary key (user_id, step_index)
);

create table if not exists public.point_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  amount integer not null,
  pending boolean not null default false,
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  about text not null,
  relationship text,
  days text not null,
  capsules text not null,
  outcomes text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.dose_logs enable row level security;
alter table public.base_progress enable row level security;
alter table public.point_events enable row level security;
alter table public.stories enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy invites_all_own on public.invites
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy dose_logs_all_own on public.dose_logs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy base_progress_all_own on public.base_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy point_events_all_own on public.point_events
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy stories_all_own on public.stories
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- GEMA lock: true only when all five BASE steps are done.
create or replace function public.lifestyle_base_complete(p_user uuid default auth.uid())
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce((
    select count(*) filter (where done) = 5
    from public.base_progress
    where user_id = p_user
  ), false);
$$;

revoke all on function public.lifestyle_base_complete(uuid) from public;
grant execute on function public.lifestyle_base_complete(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('dose-proofs', 'dose-proofs', false)
on conflict (id) do nothing;

create policy dose_proofs_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'dose-proofs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy dose_proofs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'dose-proofs'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy dose_proofs_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'dose-proofs'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'dose-proofs'
    and split_part(name, '/', 1) = auth.uid()::text
  );
