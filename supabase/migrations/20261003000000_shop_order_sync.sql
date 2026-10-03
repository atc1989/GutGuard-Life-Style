-- Back-end task 3 (Addendum 05): a paid website shop order updates the buyer's Lifestyle page.
--
-- The website calls public.lifestyle_apply_shop_order(payload) with the Lifestyle service role:
--   * event 'paid'      : from the website Maya webhook, when an order becomes paid;
--   * event 'delivered' : from the website admin, when an order is marked Delivered (status fulfilled).
-- Payload: { order_code, event, at (ISO date), email, mobile, for_other, recipient_mobile,
--            items: [{ id, qty }] }   (ids from the website lib/catalog.ts)
--
-- Rules (Addendum 05, Part C, task 3):
--   * Match a person by email first, then by mobile (last 10 digits). Exactly one profile, or none.
--   * E-Points go to the payer. The number is the one the website Done screen shows.
--     Each order pays once (point_events.source_ref = 'shop:<order_code>').
--   * The stage goes to the person who takes the capsules (the payer, or the recipient of a gift).
--     A stage only goes up, never down.
--   * Nobody matched yet? The order waits in shop_order_sync and is applied when that person signs
--     up or logs in (lifestyle_claim_shop_orders(), called by the member's own session).
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
  event text not null check (event in ('paid', 'delivered')),
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

-- one profile by email, else by mobile (last 10 digits), else null
create or replace function public.lifestyle_match_profile(p_email text, p_mobile text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  e text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  m text := right(regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g'), 10);
  ids uuid[];
begin
  if e is not null then
    select array_agg(id) into ids from public.profiles where lower(btrim(email)) = e;
    if cardinality(ids) = 1 then return ids[1]; end if;
  end if;
  if length(m) = 10 then
    select array_agg(id) into ids from public.profiles
     where right(regexp_replace(coalesce(mobile, ''), '\D', '', 'g'), 10) = m;
    if cardinality(ids) = 1 then return ids[1]; end if;
  end if;
  return null;
end;
$$;

-- E-Points shown on the website Done screen: packs by capsules / 10; a plan by its blisters per month
create or replace function public.lifestyle_shop_points(p_items jsonb)
returns integer
language sql
immutable
as $$
  select coalesce(sum(
    case
      when i->>'id' in ('watch', 'blister') then 1
      when i->>'id' in ('bottle', 'start') then 3
      when i->>'id' = 'grow' then 9
      when i->>'id' = 'peak' then 33
      when i->>'id' like 'plan-keep-%' then 6
      when i->>'id' like 'plan-better-%' then 12
      when i->>'id' like 'plan-full-%' then 18
      else 0
    end * case when i->>'id' like 'plan-%' then 1 else greatest(coalesce((i->>'qty')::int, 1), 1) end
  ), 0)::int
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
  plan_item text;
  has_watch boolean;
  has_pack boolean;
  at_date date;
  prof public.profiles%rowtype;
begin
  select * into r from public.shop_order_sync where order_code = p_code and event = p_event for update;
  if not found or r.applied_at is not null then return true; end if;
  p := r.payload;
  items := coalesce(p->'items', '[]'::jsonb);
  at_date := coalesce((p->>'at')::date, current_date);
  has_watch := exists (select 1 from jsonb_array_elements(items) i where i->>'id' = 'watch');
  has_pack := exists (select 1 from jsonb_array_elements(items) i where i->>'id' in ('blister', 'bottle', 'start', 'grow', 'peak'));
  select i->>'id' into plan_item from jsonb_array_elements(items) i where i->>'id' like 'plan-%' limit 1;

  r.payer_id := coalesce(r.payer_id, public.lifestyle_match_profile(p->>'email', p->>'mobile'));
  r.taker_id := coalesce(r.taker_id, case
    when coalesce((p->>'for_other')::boolean, false) then public.lifestyle_match_profile(null, p->>'recipient_mobile')
    else r.payer_id end);

  perform set_config('lifestyle.trusted', 'on', true);

  if p_event = 'paid' then
    -- E-Points to the payer, once per order
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

    -- stage to the person who takes the capsules
    if not r.stage_done and r.taker_id is not null then
      select * into prof from public.profiles where id = r.taker_id for update;
      if plan_item is not null then
        update public.profiles set
          lifestyle_stage = case when public.lifestyle_stage_rank(lifestyle_stage) < 4 then 'member' else lifestyle_stage end,
          plan_goal = split_part(plan_item, '-', 2),
          plan_cadence = split_part(plan_item, '-', 3),
          plan_skips = case when plan_status = 'active' then plan_skips else 0 end,
          plan_status = 'active',
          plan_started_on = at_date,
          plan_paused_until = null
        where id = r.taker_id;
      elsif has_pack then
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
-- false when it waits for the person to sign up.
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
  if code is null or ev not in ('paid', 'delivered') then
    raise exception 'order_code and event (paid or delivered) are required';
  end if;
  insert into public.shop_order_sync (order_code, event, payload)
  values (code, ev, p)
  on conflict (order_code, event) do nothing;
  -- delivered never runs before paid
  if ev = 'delivered' and exists (select 1 from public.shop_order_sync where order_code = code and event = 'paid' and applied_at is null) then
    perform public.lifestyle_try_shop_order(code, 'paid');
  end if;
  return public.lifestyle_try_shop_order(code, ev);
end;
$$;

-- Called by the member's own session after sign-up and after log-in. Applies their waiting orders.
create or replace function public.lifestyle_claim_shop_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.profiles%rowtype;
  m text;
  w record;
  n integer := 0;
begin
  select * into me from public.profiles where id = auth.uid();
  if not found then return 0; end if;
  m := right(regexp_replace(coalesce(me.mobile, ''), '\D', '', 'g'), 10);
  for w in
    select order_code, event from public.shop_order_sync s
     where s.applied_at is null
       and (lower(btrim(coalesce(s.payload->>'email', ''))) = lower(btrim(coalesce(me.email, '-')))
            or (length(m) = 10 and right(regexp_replace(coalesce(s.payload->>'mobile', ''), '\D', '', 'g'), 10) = m)
            or (length(m) = 10 and right(regexp_replace(coalesce(s.payload->>'recipient_mobile', ''), '\D', '', 'g'), 10) = m))
     order by s.created_at, s.event desc  -- 'paid' before 'delivered'
  loop
    if public.lifestyle_try_shop_order(w.order_code, w.event) then n := n + 1; end if;
  end loop;
  return n;
end;
$$;

revoke all on function public.lifestyle_match_profile(text, text) from public, anon, authenticated;
revoke all on function public.lifestyle_try_shop_order(text, text) from public, anon, authenticated;
revoke all on function public.lifestyle_apply_shop_order(jsonb) from public, anon, authenticated;
grant execute on function public.lifestyle_apply_shop_order(jsonb) to service_role;
grant execute on function public.lifestyle_match_profile(text, text) to service_role;
grant execute on function public.lifestyle_try_shop_order(text, text) to service_role;
revoke all on function public.lifestyle_claim_shop_orders() from public, anon;
grant execute on function public.lifestyle_claim_shop_orders() to authenticated;
