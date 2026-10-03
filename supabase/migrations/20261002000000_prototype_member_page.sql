-- Prototype member page (Addendum 05).
-- The fields the approved Lifestyle page reads, on the member's own profile row.
--
-- Who writes what:
--   lifestyle_stage, plan_*, trial_started_on : the server only (shop webhook / admin, service role)
--   dose_morning, dose_midday, dose_dreams     : the member, from Settings ("Adjusted")
--   guardian_at                                : lifestyle_mark_guardian(), which checks the 5 nights
--
-- The trigger below stops a member from setting the server-only fields with their own session,
-- because profiles_insert_own and profiles_update_own let a member write any column of their row.

-- Pre-flight: member_requests uses lifestyle_is_admin(), which reads public.app_roles.
-- Staging was recorded without app_roles (supabase/patches/README.md). Stop here, before any change.
do $$
begin
  if to_regclass('public.profiles') is null or to_regclass('public.dose_logs') is null then
    raise exception 'Lifestyle tables are missing. Wrong project?';
  end if;
  if to_regclass('public.app_roles') is null
     or to_regprocedure('public.lifestyle_is_admin(uuid)') is null then
    raise exception 'public.app_roles or lifestyle_is_admin() is missing. Apply 20260902000000_lifestyle_admin_rbac.sql (app_roles part) first.';
  end if;
end $$;

alter table public.profiles
  add column if not exists lifestyle_stage text not null default 'card'
    check (lifestyle_stage in ('card', 'ordered', 'trial', 'member', 'base', 'builder')),
  add column if not exists trial_started_on date,
  add column if not exists plan_goal text check (plan_goal in ('keep', 'better', 'full')),
  add column if not exists plan_cadence text check (plan_cadence in ('monthly', 'quarterly')),
  add column if not exists plan_status text check (plan_status in ('active', 'paused', 'cancelled')),
  add column if not exists plan_started_on date,
  add column if not exists plan_skips integer not null default 0 check (plan_skips >= 0),
  add column if not exists plan_paused_until date,
  add column if not exists dose_morning smallint check (dose_morning between 0 and 4),
  add column if not exists dose_midday smallint check (dose_midday between 0 and 4),
  add column if not exists dose_dreams smallint check (dose_dreams between 0 and 4),
  add column if not exists guardian_at timestamptz;

create or replace function public.lifestyle_guard_server_fields()
returns trigger
language plpgsql
as $$
begin
  -- service role (webhooks, admin tools), SQL editor sessions and the security-definer
  -- function below pass; a member's own session does not
  if coalesce(auth.role(), 'service_role') <> 'authenticated'
     or current_setting('lifestyle.trusted', true) = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    -- a member creating their own row starts as a card holder, whatever they sent
    new.lifestyle_stage := 'card';
    new.trial_started_on := null;
    new.plan_goal := null; new.plan_cadence := null; new.plan_status := null;
    new.plan_started_on := null; new.plan_skips := 0; new.plan_paused_until := null;
    new.guardian_at := null;
    return new;
  end if;
  if new.guardian_at is distinct from old.guardian_at
     or new.lifestyle_stage is distinct from old.lifestyle_stage
     or new.trial_started_on is distinct from old.trial_started_on
     or new.plan_goal is distinct from old.plan_goal
     or new.plan_cadence is distinct from old.plan_cadence
     or new.plan_status is distinct from old.plan_status
     or new.plan_started_on is distinct from old.plan_started_on
     or new.plan_skips is distinct from old.plan_skips
     or new.plan_paused_until is distinct from old.plan_paused_until then
    raise exception 'These fields are set by Gutguard, not by the member.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lifestyle_guard_server_fields on public.profiles;
create trigger lifestyle_guard_server_fields
  before insert or update on public.profiles
  for each row execute function public.lifestyle_guard_server_fields();

-- Gut Guardian, earned: a trial member with Taps done on 5 different nights since the trial
-- started (or in the last 30 days when the start date is not set yet). Members on a pack or a
-- plan are Gut Guardians by stage and do not need this.
create or replace function public.lifestyle_mark_guardian()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.profiles%rowtype;
  nights integer;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then return false; end if;
  if p.guardian_at is not null then return true; end if;
  if p.lifestyle_stage <> 'trial' then return false; end if;

  select count(*) into nights
  from public.dose_logs d
  where d.user_id = p.id
    and d.dreams
    and d.log_date >= coalesce(p.trial_started_on, current_date - 30);
  if nights < 5 then return false; end if;

  perform set_config('lifestyle.trusted', 'on', true);
  update public.profiles set guardian_at = now() where id = p.id;
  perform set_config('lifestyle.trusted', 'off', true);
  return true;
end;
$$;

revoke all on function public.lifestyle_mark_guardian() from public, anon;
grant execute on function public.lifestyle_mark_guardian() to authenticated;

-- ---------------------------------------------------------------------------
-- Member requests (Addendum 05). Skip, pause, resume, cancel, change goal, plan or payment, and reward
-- redemptions are saved here for Gutguard staff to confirm. The member page says "Request sent";
-- nothing changes on the plan until staff (or the back-end task that replaces them) acts.
-- The monthly payment-link job must not send a link while a skip, pause or cancel is pending.
-- ---------------------------------------------------------------------------
create table if not exists public.member_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('skip', 'pause', 'resume', 'cancel', 'goal', 'plan', 'payment', 'redeem')),
  detail jsonb not null default '{}'::jsonb check (pg_column_size(detail) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'done', 'declined')),
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  handled_by uuid references auth.users (id)
);

alter table public.member_requests enable row level security;

drop policy if exists member_requests_select on public.member_requests;
create policy member_requests_select on public.member_requests
  for select to authenticated
  using (user_id = auth.uid() or public.lifestyle_is_admin());

drop policy if exists member_requests_insert_own on public.member_requests;
create policy member_requests_insert_own on public.member_requests
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and handled_at is null and handled_by is null);

drop policy if exists member_requests_update_admin on public.member_requests;
create policy member_requests_update_admin on public.member_requests
  for update to authenticated
  using (public.lifestyle_is_admin())
  with check (public.lifestyle_is_admin());

create index if not exists member_requests_pending on public.member_requests (created_at) where status = 'pending';
