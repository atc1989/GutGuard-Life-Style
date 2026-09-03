-- Change 3 — what migrations/20260904000000_shared_person_profiles.sql must hold.
--
-- Run against a scratch Postgres with the Supabase stubs and the Lifestyle
-- migrations applied in order (see supabase/tests/README.md). Every check
-- raises on failure, so a clean run is a pass.

begin;

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'chg3.card@example.invalid'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'chg3.person@example.invalid');

insert into public.profiles (id, name, mobile, email, card_no, points, banked)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'Card Holder', '09995015001',
          'chg3.card@example.invalid', 'GG-T001', 40, 10);

do $$
begin
  -- 1. Identity columns are filled from the Lifestyle columns.
  if not exists (
    select 1 from public.profiles
     where id = 'aaaaaaaa-0000-0000-0000-000000000001'
       and full_name = 'Card Holder' and phone = '09995015001'
  ) then raise exception 'backfill/sync did not fill full_name and phone'; end if;

  -- 2. A person can exist without a Lifestyle card. 00 - Locks requires this:
  --    a new Auth user creates a person only, never a card.
  insert into public.profiles (id, full_name, email, account_status)
    values ('aaaaaaaa-0000-0000-0000-000000000002', 'Person Only',
            'chg3.person@example.invalid', 'active');
  if exists (
    select 1 from public.profiles
     where id = 'aaaaaaaa-0000-0000-0000-000000000002' and card_no is not null
  ) then raise exception 'a cardless person was given a card'; end if;

  -- 3. The two spellings stay in step in both directions until Change 4.
  update public.profiles set full_name = 'Renamed A'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if (select name from public.profiles
       where id = 'aaaaaaaa-0000-0000-0000-000000000001') <> 'Renamed A'
  then raise exception 'full_name did not propagate to name'; end if;

  update public.profiles set name = 'Renamed B'
   where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  if (select full_name from public.profiles
       where id = 'aaaaaaaa-0000-0000-0000-000000000001') <> 'Renamed B'
  then raise exception 'name did not propagate to full_name'; end if;

  -- 4. account_status is constrained.
  begin
    update public.profiles set account_status = 'banana'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001';
    raise exception 'account_status accepted an invalid value';
  exception when check_violation then null;
  end;
end $$;

-- 5. Members hold no UPDATE grant on the value columns. This is the check that
--    matters: profiles_update_own covers the whole row, so without column
--    grants a member can PATCH their own points and banked.
do $$
declare
  leaked text;
begin
  select string_agg(column_name, ', ' order by column_name) into leaked
    from information_schema.column_privileges
   where table_schema = 'public' and table_name = 'profiles'
     and grantee = 'authenticated' and privilege_type = 'UPDATE'
     and column_name in ('points','pending','banked','phase','claimed',
                         'account_status','card_no','sponsor','team','days_left');
  if leaked is not null then
    raise exception 'authenticated can update protected columns: %', leaked;
  end if;

  if not exists (
    select 1 from information_schema.column_privileges
     where table_schema = 'public' and table_name = 'profiles'
       and grantee = 'authenticated' and privilege_type = 'UPDATE'
       and column_name = 'full_name'
  ) then raise exception 'authenticated cannot update its own full_name'; end if;
end $$;

-- 6. Status changes go through the admin-only definer function.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.sub = 'aaaaaaaa-0000-0000-0000-000000000001';
  begin
    perform public.set_account_status(
      'aaaaaaaa-0000-0000-0000-000000000001', 'suspended');
    raise exception 'a non-admin changed an account status';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
rollback;
