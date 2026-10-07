-- Addendum 05: run after 20261002000000_prototype_member_page.sql. Every row must say ok = true.
select 'profiles: 12 new columns' as test, count(*) = 12 as ok
  from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles'
   and column_name in ('lifestyle_stage','trial_started_on','plan_goal','plan_cadence','plan_status',
                       'plan_started_on','plan_skips','plan_paused_until','dose_morning','dose_midday',
                       'dose_dreams','guardian_at')
union all
select 'trigger lifestyle_guard_server_fields', count(*) = 1
  from pg_trigger where tgname = 'lifestyle_guard_server_fields' and not tgisinternal
union all
select 'lifestyle_mark_guardian(): authenticated only',
       has_function_privilege('authenticated', 'public.lifestyle_mark_guardian()', 'execute')
       and not has_function_privilege('anon', 'public.lifestyle_mark_guardian()', 'execute')
union all
select 'member_requests: RLS on', coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.member_requests')), false)
union all
select 'member_requests: 3 policies', count(*) = 3 from pg_policies where tablename = 'member_requests'
union all
select 'every profile has a stage', not exists (select 1 from public.profiles where lifestyle_stage is null);
