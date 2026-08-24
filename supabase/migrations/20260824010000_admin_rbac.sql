-- Epic 5: Admin RBAC. Members cannot self-promote.
-- First operator is granted in the SQL editor (no JWT) or via the service-role client.

alter table public.profiles
  add column if not exists role text not null default 'member';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('member', 'admin'));

comment on column public.profiles.role is
  'RBAC: member (default) or admin. Mutated only by service_role or the SQL editor. First admin is granted in the dashboard.';

create index if not exists profiles_role_admin_idx
  on public.profiles (role)
  where role = 'admin';

create or replace function public.profiles_protect_role()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text := coalesce(auth.role(), '');
begin
  -- Empty jwt_role: SQL editor / migrations. service_role: admin.ts.
  -- authenticated members cannot insert as admin or change role.
  if tg_op = 'INSERT' then
    if new.role is distinct from 'member' and jwt_role not in ('service_role', '') then
      raise exception 'profiles.role cannot be set by this session';
    end if;
    return new;
  end if;

  if new.role is distinct from old.role and jwt_role not in ('service_role', '') then
    raise exception 'profiles.role can only be changed by a service-role client';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before insert or update on public.profiles
  for each row
  execute procedure public.profiles_protect_role();

-- Cookie-session gate used by proxy.ts and app/admin/layout.tsx.
-- Invoker: reads the caller's own profile row (RLS allows own-row select).
create or replace function public.lifestyle_is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.lifestyle_is_admin() is
  'True when the current Auth user has profiles.role = admin. Used to gate /admin without the service-role key.';

revoke all on function public.lifestyle_is_admin() from public;
grant execute on function public.lifestyle_is_admin() to authenticated;
