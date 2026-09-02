-- Admin RBAC for Lifestyle. Members cannot self-escalate.

create table if not exists public.app_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.app_roles enable row level security;

-- No INSERT/UPDATE/DELETE for authenticated. Admins may SELECT their own row.
create policy app_roles_select_own on public.app_roles
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.lifestyle_is_admin(p_user uuid default auth.uid())
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.app_roles
    where user_id = p_user
      and role = 'admin'
  );
$$;

revoke all on function public.lifestyle_is_admin(uuid) from public;
grant execute on function public.lifestyle_is_admin(uuid) to authenticated;

-- Admins can read every member profile for support tables.
create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.lifestyle_is_admin());

create policy invites_select_admin on public.invites
  for select to authenticated
  using (public.lifestyle_is_admin());

create policy dose_logs_select_admin on public.dose_logs
  for select to authenticated
  using (public.lifestyle_is_admin());

create policy base_progress_select_admin on public.base_progress
  for select to authenticated
  using (public.lifestyle_is_admin());

create policy point_events_select_admin on public.point_events
  for select to authenticated
  using (public.lifestyle_is_admin());

create policy stories_select_admin on public.stories
  for select to authenticated
  using (public.lifestyle_is_admin());

-- Assign admins only via SQL / service role, e.g.:
-- insert into public.app_roles (user_id, role) values ('…', 'admin');
