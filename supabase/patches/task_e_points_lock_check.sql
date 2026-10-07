-- Addendum 05, task E: run after task_e_points_lock.sql. Every row must say ok = true.
select 'trigger lifestyle_guard_points' as test,
       exists (select 1 from pg_trigger where tgname = 'lifestyle_guard_points' and not tgisinternal) as ok
union all
select 'point_events: members read only',
       not exists (select 1 from pg_policies where tablename = 'point_events' and policyname = 'point_events_all_own')
       and exists (select 1 from pg_policies where tablename = 'point_events' and policyname = 'point_events_select_own' and cmd = 'SELECT');
