-- Change 3 preflight. READ ONLY — run this on Staging before applying
-- migrations/20260904000000_shared_person_profiles.sql and send back the output.
--
-- The migration was written from the migration files in this repo. This checks
-- the database actually matches them. Do not apply the migration if section 1
-- or 4 disagrees with what the migration expects.

-- 1. The real shape of public.profiles.
select ordinal_position, column_name, data_type, is_nullable, column_default
  from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles'
 order by ordinal_position;

-- 2. Every policy on it today.
select policyname, cmd, roles::text, qual, with_check
  from pg_policies
 where schemaname = 'public' and tablename = 'profiles'
 order by policyname;

-- 3. Column-level grants already in place (expect none before the migration).
select grantee, privilege_type, column_name
  from information_schema.column_privileges
 where table_schema = 'public' and table_name = 'profiles'
   and grantee in ('authenticated', 'anon')
 order by grantee, column_name;

-- 4. Objects the migration depends on. Both must come back true.
select
  to_regprocedure('public.lifestyle_is_admin(uuid)') is not null as has_lifestyle_is_admin,
  to_regclass('public.app_roles')                    is not null as has_app_roles;

-- 5. How much data is at stake, and whether the backfill has anything to lose.
select
  (select count(*) from auth.users)                                as auth_users,
  (select count(*) from public.profiles)                           as public_profiles,
  (select count(*) from public.profiles where btrim(coalesce(name, '')) = '')   as blank_name,
  (select count(*) from public.profiles where btrim(coalesce(mobile, '')) = '') as blank_mobile;

-- 6. The six Auth users with no person row — the reconcile problem.
select u.id, u.email, u.created_at,
       (u.raw_user_meta_data->>'provider') as provider,
       (u.raw_user_meta_data->>'username') as username
  from auth.users u
  left join public.profiles p on p.id = u.id
 where p.id is null
 order by u.created_at;

-- 7. Same question against the GEMA spine.
select u.id, u.email
  from auth.users u
  left join gema.profiles g on g.id = u.id
 where g.id is null
 order by u.created_at;

-- 8. Triggers on auth.users — which app's handle_new_user is actually armed.
select t.tgname, n.nspname || '.' || p.proname as function
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
  join pg_namespace n on n.oid = p.pronamespace
 where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal
 order by t.tgname;

-- 9. The body of every trigger function armed on auth.users, plus any function
--    named handle_new_user in any schema.
--
--    This matters more than it looks. GEMA's supabase/fix_auth_user_triggers.sql
--    defines public.handle_new_user() inserting first_name/last_name/full_name
--    into public.profiles. The 2026-09-03 Staging report described a
--    handle_new_user that writes gema.profiles instead. Both cannot be the same
--    function. Staging's public.profiles is Lifestyle-shaped and has none of
--    those columns, so if the GEMA version is what is armed there, creating an
--    Auth user on Staging should be failing outright — and it is not, because
--    15 users exist. Read the body rather than guess which one it is.
select n.nspname as schema, p.proname as name, pg_get_functiondef(p.oid) as body
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where p.proname like '%handle_new_user%'
    or p.oid in (
      select tgfoid from pg_trigger
       where tgrelid = 'auth.users'::regclass and not tgisinternal
    )
 order by n.nspname, p.proname;

-- 10. Does gema.profiles exist on Staging at all, and what shape.
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'gema' and table_name = 'profiles'
 order by ordinal_position;
