-- Addendum 05 rollback. Undoes 20261002000000_prototype_member_page.sql.
-- WARNING: this deletes the member requests, adjusted doses, plan fields and Gut Guardian dates.
-- Export them first (Table editor -> Export CSV: member_requests, and the profiles columns below).
-- Roll back the app too (Vercel: promote the previous deployment) before or together with this.
begin;
drop table if exists public.member_requests;
drop function if exists public.lifestyle_mark_guardian();
drop trigger if exists lifestyle_guard_server_fields on public.profiles;
drop function if exists public.lifestyle_guard_server_fields();
alter table public.profiles
  drop column if exists lifestyle_stage,
  drop column if exists trial_started_on,
  drop column if exists plan_goal,
  drop column if exists plan_cadence,
  drop column if exists plan_status,
  drop column if exists plan_started_on,
  drop column if exists plan_skips,
  drop column if exists plan_paused_until,
  drop column if exists dose_morning,
  drop column if exists dose_midday,
  drop column if exists dose_dreams,
  drop column if exists guardian_at;
commit;
