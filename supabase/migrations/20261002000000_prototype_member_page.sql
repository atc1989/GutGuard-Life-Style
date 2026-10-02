-- Prototype member page (Addendum 05).
-- The fields the approved Lifestyle page reads, on the member's own profile row.
--
-- Who writes what:
--   lifestyle_stage, plan_*, trial_started_on : the server only (shop webhook / admin, service role)
--   dose_morning, dose_midday, dose_dreams     : the member, from Settings ("Adjusted")
--   guardian_at                                : the member page, when Night 5 is complete
--
-- The trigger below stops a member from changing the server-only fields with their own session,
-- because profiles_update_own lets a member update any column of their row.

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
  -- service role (webhooks, admin tools) and SQL editor sessions pass; a member session does not
  if coalesce(auth.role(), 'service_role') <> 'authenticated' then
    return new;
  end if;
  if new.lifestyle_stage is distinct from old.lifestyle_stage
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
  before update on public.profiles
  for each row execute function public.lifestyle_guard_server_fields();
