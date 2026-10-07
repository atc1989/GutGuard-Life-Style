-- Undo task_e_points_lock.sql: members can write their own E-Points again (the old behaviour).
-- Use it only together with rolling the Lifestyle app back to a version from before task E.
begin;
drop trigger if exists lifestyle_guard_points on public.profiles;
drop function if exists public.lifestyle_guard_points();
drop policy if exists point_events_select_own on public.point_events;
drop policy if exists point_events_all_own on public.point_events;
create policy point_events_all_own on public.point_events
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
commit;
