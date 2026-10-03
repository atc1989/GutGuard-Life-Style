-- Addendum 05, task E: E-Points are written by the server only.
-- Apply TOGETHER WITH the code change in task E (the old overlays write points from the member's
-- session; after this file those writes fail). Not in migrations/ on purpose, so a database reset
-- does not apply it before the code is ready. Then move it into migrations/ with the code.
-- Before E-Points have value, and before task 3 goes live.

create or replace function public.lifestyle_guard_points()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), 'service_role') <> 'authenticated'
     or current_setting('lifestyle.trusted', true) = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.points := 0; new.pending := 0; new.banked := 0;
    return new;
  end if;
  if new.points is distinct from old.points
     or new.pending is distinct from old.pending
     or new.banked is distinct from old.banked then
    raise exception 'E-Points are set by Gutguard, not by the member.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lifestyle_guard_points on public.profiles;
create trigger lifestyle_guard_points
  before insert or update on public.profiles
  for each row execute function public.lifestyle_guard_points();

-- members read their own E-Points history; only the server adds to it
drop policy if exists point_events_all_own on public.point_events;
drop policy if exists point_events_select_own on public.point_events;
create policy point_events_select_own on public.point_events
  for select to authenticated using (user_id = auth.uid());
