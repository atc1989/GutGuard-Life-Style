-- Change 3 — public.profiles becomes the shared person table.
--
-- Staging only (fxdsnacuonfvutdquogb). Production Auth rvwseybgimmewuoccecu is
-- untouched: GEMA still reads identity from gema.profiles and nothing here
-- changes that.
--
-- EXPAND ONLY. Nothing is renamed and nothing is dropped. Lifestyle keeps
-- writing name/mobile and keeps working unchanged; Academy gets the columns it
-- already queries. Change 4 does the contract half — moving card/points out to
-- their own table and dropping the duplicates left behind here.
--
-- Why this is needed at all: public.profiles today is the Lifestyle card table
-- (card_no, phase, points, banked...). Academy's src/lib/ops/profile.ts already
-- selects full_name and email from it and silently reads "not enrolled",
-- because those columns are not there. One table, three shapes.

begin;

-- 1. Identity columns. The person, not the card.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists locale text,
  add column if not exists timezone text,
  add column if not exists account_status text not null default 'active',
  add column if not exists last_seen_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_account_status_check;
alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('active', 'suspended', 'closed'));

-- 2. Backfill from the Lifestyle columns that already hold this data.
update public.profiles
   set full_name = coalesce(full_name, nullif(btrim(name), '')),
       phone     = coalesce(phone, nullif(btrim(mobile), ''))
 where full_name is null
    or phone is null;

-- 3. A person can now exist without a Lifestyle card.
--
-- 00 - Locks: "New Auth user creates a person only. Never auto-enrol Academy
-- BASE or a Lifestyle card." That is currently impossible to honour — name,
-- mobile and card_no are NOT NULL and card_no has no default, so inserting a
-- person row forces a card into being. Existing rows keep their values.
alter table public.profiles alter column name    drop not null;
alter table public.profiles alter column mobile  drop not null;
alter table public.profiles alter column card_no drop not null;
alter table public.profiles alter column sponsor drop not null;
alter table public.profiles alter column team    drop not null;

-- 4. Keep the old and new spellings in step until Change 4 removes the old
--    ones. Lifestyle writes name/mobile; Academy writes full_name. Either
--    side updating one fills the other, so both apps read a complete person.
create or replace function public.sync_profile_identity()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  -- Prefer whichever side this statement actually changed.
  if tg_op = 'INSERT' then
    new.full_name := coalesce(nullif(btrim(new.full_name), ''), nullif(btrim(new.name), ''));
    new.name      := coalesce(nullif(btrim(new.name), ''), nullif(btrim(new.full_name), ''));
    new.phone     := coalesce(nullif(btrim(new.phone), ''), nullif(btrim(new.mobile), ''));
    new.mobile    := coalesce(nullif(btrim(new.mobile), ''), nullif(btrim(new.phone), ''));
    return new;
  end if;

  if new.full_name is distinct from old.full_name then
    new.name := new.full_name;
  elsif new.name is distinct from old.name then
    new.full_name := new.name;
  end if;

  if new.phone is distinct from old.phone then
    new.mobile := new.phone;
  elsif new.mobile is distinct from old.mobile then
    new.phone := new.mobile;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_identity on public.profiles;
create trigger profiles_sync_identity
  before insert or update on public.profiles
  for each row execute function public.sync_profile_identity();

-- 5. Members must not write their own status, role-ish flags, or points.
--
-- profiles_update_own (20260822000000) grants UPDATE on the whole row, so a
-- member can currently set their own points, banked, phase and claimed with a
-- single PATCH. RLS cannot express column limits; column GRANTs can. The row
-- policy still applies on top of this — both must pass.
revoke update on public.profiles from authenticated;
grant update (
  full_name,
  name,
  phone,
  mobile,
  email,
  avatar_url,
  locale,
  timezone,
  telegram,
  facebook,
  notifications,
  welcome_seen,
  capsules_per_day,
  updated_at
) on public.profiles to authenticated;

-- account_status is admin-only, via a definer function rather than a grant.
create or replace function public.set_account_status(p_user uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.lifestyle_is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('active', 'suspended', 'closed') then
    raise exception 'invalid account status: %', p_status using errcode = '22023';
  end if;
  update public.profiles set account_status = p_status where id = p_user;
end;
$$;

revoke all on function public.set_account_status(uuid, text) from public;
grant execute on function public.set_account_status(uuid, text) to authenticated;

commit;
