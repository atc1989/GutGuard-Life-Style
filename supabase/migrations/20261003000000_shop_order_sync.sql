-- Back-end task 3 (Addendum 05): a website shop order updates the buyer's Lifestyle page.
--
-- The website calls public.lifestyle_apply_shop_order(payload) with the Lifestyle service role:
--   * event 'paid'      : the order became paid (Maya webhook, reconcile, or staff in the website admin);
--   * event 'delivered' : staff marked the order Delivered (status fulfilled) in the website admin;
--   * event 'refunded'  : staff marked the payment refunded in the website admin.
-- Payload: { order_code, event, at (YYYY-MM-DD, Manila), email, mobile, for_other, recipient_mobile,
--            items: [{ id, qty, caps }] }   (the order's own items from shop_orders.items)
--
-- Rules (Addendum 05, Part C, task 3):
--   * E-Points: 1 per blister (10 capsules) paid, to the PAYER, found by the checkout email.
--     Only a confirmed log-in email counts (auth.users.email_confirmed_at), because members can edit
--     the email on their profile. Each order pays once (point_events.source_ref = 'shop:<code>').
--     A refund takes the order's E-Points back once ('shop:<code>:refund'). The stage stays.
--   * Stage: to the person who TAKES the capsules: the gift recipient (by mobile), or the payer
--     (by email, else by mobile). A stage only goes up.
--   * Nobody matched yet? The order waits in shop_order_sync. It is applied when that person opens
--     /app (lifestyle_claim_shop_orders(), called with the member's own session).
--   * Calling twice with the same order and event is safe.

do $$
begin
  if to_regprocedure('public.lifestyle_mark_guardian()') is null then
    raise exception 'Apply 20261002000000_prototype_member_page.sql first.';
  end if;
end $$;

alter table public.point_events add column if not exists source_ref text;
create unique index if not exists point_events_source_ref_key on public.point_events (source_ref);

create table if not exists public.shop_order_sync (
  order_code text not null,
  event text not null check (event in ('paid', 'delivered', 'refunded')),
  payload jsonb not null,
  payer_id uuid references public.profiles (id) on delete set null,
  taker_id uuid references public.profiles (id) on delete set null,
  points_done boolean not null default false,
  stage_done boolean not null default false,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  primary key (order_code, event)
);

alter table public.shop_order_sync enable row level security;
drop policy if exists shop_order_sync_select_admin on public.shop_order_sync;
create policy shop_order_sync_select_admin on public.shop_order_sync
  for select to authenticated using (public.lifestyle_is_admin());
create index if not exists shop_order_sync_waiting on public.shop_order_sync (created_at) where applied_at is null;

-- the profile whose CONFIRMED log-in email is this one
create or replace function public.lifestyle_match_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
    from auth.users u join public.profiles p on p.id = u.id
   where lower(btrim(u.email)) = nullif(lower(btrim(coalesce(p_email, ''))), '')
     and u.email_confirmed_at is not null
   limit 1;
$$;

-- the one profile with this mobile (last 10 digits), or null when none or more than one
create or replace function public.lifestyle_match_mobile(p_mobile text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  m text := right(regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g'), 10);
  ids uuid[];
begin
  if length(m) <> 10 then return null; end if;
  select array_agg(id) into ids from public.profiles
   where right(regexp_replace(coalesce(mobile, ''), '\D', '', 'g'), 10) = m;
  if cardinality(ids) = 1 then return ids[1]; end if;
  return null;
end;
$$;

-- 1 E-Point per blister (10 capsules): Watch 1, Blister 1, Bottle 3, Start 3, Grow 9, Peak 33,
-- Gutguard Daily 6 / 12 / 18 a month (18 / 36 / 54 every 3 months). Uses the capsules saved on the
-- order line; the id list is a fallback for lines without them (old ids included).
create or replace function public.lifestyle_shop_points(p_items jsonb)
returns integer
language sql
immutable
as $$
  select coalesce(sum(
    coalesce(
      nullif(i->>'caps', '')::int,
      case i->>'id'
        when 'watch' then 10 when 'blister' then 10 when 'trial-blister' then 10
        when 'bottle' then 30 when 'trial-bottle' then 30 when 'start' then 30
        when 'grow' then 90 when 'peak' then 330
        when 'plan-keep-monthly' then 60 when 'plan-better-monthly' then 120 when 'plan-full-monthly' then 180
        when 'plan-keep-quarterly' then 180 when 'plan-better-quarterly' then 360 when 'plan-full-quarterly' then 540
        else 0 end)
    * greatest(coalesce(nullif(i->>'qty', '')::int, 1), 1)
  ), 0)::int / 10
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) i;
$$;

create or replace function public.lifestyle_stage_rank(p_stage text)
returns integer
language sql
immutable
as $$
  select array_position(array['card', 'ordered', 'trial', 'member', 'base', 'builder'], coalesce(p_stage, 'card'));
$$;

create or replace function public.lifestyle_try_shop_order(p_code text, p_event text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.shop_order_sync%rowtype;
  p jsonb;
  items jsonb;
  pts integer;
  given public.point_events%rowtype;
  plan_item text;
  has_watch boolean;
  has_pack boolean;
  at_date date;
begin
  select * into r from public.shop_order_sync where order_code = p_code and event = p_event for update;
  if not found or r.applied_at is not null then return true; end if;
  p := r.payload;
  items := coalesce(p->'items', '[]'::jsonb);
  at_date := coalesce(nullif(p->>'at', '')::date, current_date);
  has_watch := exists (select 1 from jsonb_array_elements(items) i where i->>'id' = 'watch');
  has_pack := exists (select 1 from jsonb_array_elements(items) i where i->>'id' <> 'watch' and i->>'id' not like 'plan-%');
  select i->>'id' into plan_item from jsonb_array_elements(items) i where i->>'id' like 'plan-%' limit 1;

  r.payer_id := coalesce(r.payer_id, public.lifestyle_match_email(p->>'email'));
  r.taker_id := coalesce(r.taker_id, case
    when coalesce((p->>'for_other')::boolean, false) then public.lifestyle_match_mobile(p->>'recipient_mobile')
    else coalesce(r.payer_id, public.lifestyle_match_mobile(p->>'mobile')) end);

  perform set_config('lifestyle.trusted', 'on', true);

  if p_event = 'paid' then
    if not r.points_done and r.payer_id is not null then
      pts := public.lifestyle_shop_points(items);
      if pts > 0 then
        insert into public.point_events (user_id, kind, amount, pending, label, source_ref)
        values (r.payer_id, 'shop_order', pts, false, 'Shop order ' || p_code, 'shop:' || p_code)
        on conflict (source_ref) do nothing;
        if found then
          update public.profiles set points = points + pts where id = r.payer_id;
        end if;
      end if;
      r.points_done := true;
    end if;

    if not r.stage_done and r.taker_id is not null then
      if plan_item is not null then
        -- A new plan (or one that was paused or cancelled) starts on the payment date.
        -- A renewal of an active plan changes nothing here: the task 5 job moves the cycle.
        update public.profiles set
          plan_goal = split_part(plan_item, '-', 2),
          plan_cadence = split_part(plan_item, '-', 3),
          plan_skips = 0,
          plan_status = 'active',
          plan_started_on = at_date,
          plan_paused_until = null
        where id = r.taker_id and plan_status is distinct from 'active';
      end if;
      if plan_item is not null or has_pack then
        update public.profiles set lifestyle_stage = 'member'
        where id = r.taker_id and public.lifestyle_stage_rank(lifestyle_stage) < 4;
      elsif has_watch then
        update public.profiles set lifestyle_stage = 'ordered'
        where id = r.taker_id and public.lifestyle_stage_rank(lifestyle_stage) < 2;
      end if;
      r.stage_done := true;
    end if;

  elsif p_event = 'delivered' then
    r.points_done := true;
    if not r.stage_done and r.taker_id is not null then
      if has_watch then
        update public.profiles set lifestyle_stage = 'trial', trial_started_on = at_date
        where id = r.taker_id and lifestyle_stage in ('card', 'ordered');
      end if;
      r.stage_done := true;
    end if;

  elsif p_event = 'refunded' then
    r.stage_done := true;  -- the stage stays
    select * into given from public.point_events where source_ref = 'shop:' || p_code;
    if found then
      insert into public.point_events (user_id, kind, amount, pending, label, source_ref)
      values (given.user_id, 'shop_refund', -given.amount, false, 'Refund ' || p_code, 'shop:' || p_code || ':refund')
      on conflict (source_ref) do nothing;
      if found then
        update public.profiles set points = points - given.amount where id = given.user_id;
      end if;
    else
      -- the E-Points were never given: make sure they never will be
      update public.shop_order_sync set points_done = true,
        applied_at = case when stage_done then coalesce(applied_at, now()) else applied_at end
      where order_code = p_code and event = 'paid';
    end if;
    r.points_done := true;
  end if;

  perform set_config('lifestyle.trusted', 'off', true);

  update public.shop_order_sync set
    payer_id = r.payer_id, taker_id = r.taker_id,
    points_done = r.points_done, stage_done = r.stage_done,
    applied_at = case when r.points_done and r.stage_done then now() end
  where order_code = p_code and event = p_event;
  return r.points_done and r.stage_done;
end;
$$;

-- Called by the website (Lifestyle service role). Returns true when fully applied,
-- false when part of it waits for the person to sign up.
create or replace function public.lifestyle_apply_shop_order(p jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  code text := nullif(btrim(coalesce(p->>'order_code', '')), '');
  ev text := p->>'event';
begin
  if code is null or ev is null or ev not in ('paid', 'delivered', 'refunded') then
    raise exception 'order_code and event (paid, delivered or refunded) are required';
  end if;
  insert into public.shop_order_sync (order_code, event, payload)
  values (code, ev, p)
  on conflict (order_code, event) do nothing;
  -- 'delivered' and 'refunded' never run before 'paid'
  if ev <> 'paid' and exists (select 1 from public.shop_order_sync where order_code = code and event = 'paid' and applied_at is null) then
    perform public.lifestyle_try_shop_order(code, 'paid');
  end if;
  return public.lifestyle_try_shop_order(code, ev);
end;
$$;

-- Called with the member's own session when they open /app. Applies their waiting orders.
-- Candidates are found by the member's confirmed email or mobile; lifestyle_try_shop_order then
-- applies the rules above (E-Points only ever by confirmed email).
create or replace function public.lifestyle_claim_shop_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.profiles%rowtype;
  my_email text;
  m text;
  w record;
  n integer := 0;
begin
  select * into me from public.profiles where id = auth.uid();
  if not found then return 0; end if;
  select lower(btrim(email)) into my_email from auth.users where id = me.id and email_confirmed_at is not null;
  m := right(regexp_replace(coalesce(me.mobile, ''), '\D', '', 'g'), 10);
  for w in
    select order_code, event from public.shop_order_sync s
     where s.applied_at is null
       and ((my_email is not null and lower(btrim(coalesce(s.payload->>'email', ''))) = my_email)
            or (length(m) = 10 and m in (
                  right(regexp_replace(coalesce(s.payload->>'mobile', ''), '\D', '', 'g'), 10),
                  right(regexp_replace(coalesce(s.payload->>'recipient_mobile', ''), '\D', '', 'g'), 10))))
     order by s.created_at, case s.event when 'paid' then 0 when 'delivered' then 1 else 2 end
  loop
    if public.lifestyle_try_shop_order(w.order_code, w.event) then n := n + 1; end if;
  end loop;
  return n;
end;
$$;

revoke all on function public.lifestyle_match_email(text) from public, anon, authenticated;
revoke all on function public.lifestyle_match_mobile(text) from public, anon, authenticated;
revoke all on function public.lifestyle_try_shop_order(text, text) from public, anon, authenticated;
revoke all on function public.lifestyle_apply_shop_order(jsonb) from public, anon, authenticated;
grant execute on function public.lifestyle_match_email(text) to service_role;
grant execute on function public.lifestyle_match_mobile(text) to service_role;
grant execute on function public.lifestyle_try_shop_order(text, text) to service_role;
grant execute on function public.lifestyle_apply_shop_order(jsonb) to service_role;
revoke all on function public.lifestyle_claim_shop_orders() from public, anon;
grant execute on function public.lifestyle_claim_shop_orders() to authenticated;
