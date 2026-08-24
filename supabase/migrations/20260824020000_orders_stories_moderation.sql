-- Epic 7: orders + webhook inbox. Epic 8: story moderation.
-- Members queue pending orders; only service_role (webhook) reconciles status.
-- Stories enter pending; only service_role / SQL editor can approve or flag.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quantity integer not null check (quantity between 1 and 6),
  amount_centavos integer not null check (amount_centavos > 0),
  currency text not null default 'PHP',
  provider text not null default 'maya'
    check (provider in ('maya', 'bank')),
  status text not null default 'pending'
    check (status in ('pending', 'reconciled', 'failed')),
  reference text not null unique,
  provider_event_id text,
  failure_reason text,
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists orders_provider_event_id_key
  on public.orders (provider_event_id)
  where provider_event_id is not null;

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('maya', 'bank')),
  provider_event_id text not null,
  order_id uuid references public.orders (id) on delete set null,
  payload_digest text not null,
  redacted jsonb not null default '{}'::jsonb,
  signature_ok boolean not null,
  matched boolean not null default false,
  note text,
  processed_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

comment on table public.orders is
  'Queued Gutguard bottles. Status is pending until a verified Maya/bank webhook reconciles or fails the row.';
comment on table public.payment_events is
  'Idempotent webhook inbox. Stores a digest + redacted fields only — never card data or secrets.';

alter table public.stories
  add column if not exists status text not null default 'pending';

alter table public.stories
  drop constraint if exists stories_status_check;

alter table public.stories
  add constraint stories_status_check
  check (status in ('pending', 'approved', 'flagged'));

alter table public.stories
  add column if not exists moderated_at timestamptz;

alter table public.stories
  add column if not exists author_name text;

create index if not exists stories_status_created_idx
  on public.stories (status, created_at desc);

comment on column public.stories.status is
  'Moderation: pending (default) until an operator approves or flags. Members cannot self-approve.';

alter table public.orders enable row level security;
alter table public.payment_events enable row level security;

create policy orders_select_own on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy orders_insert_own on public.orders
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
  );

-- payment_events: no authenticated policies. Service role only.

drop policy if exists stories_all_own on public.stories;

create policy stories_select_visible on public.stories
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or status = 'approved'
  );

create policy stories_insert_own_pending on public.stories
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
  );

create or replace function public.orders_protect_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text := coalesce(auth.role(), '');
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'pending' and jwt_role not in ('service_role', '') then
      raise exception 'orders.status cannot be set by this session';
    end if;
    return new;
  end if;
  if new.status is distinct from old.status
     and jwt_role not in ('service_role', '') then
    raise exception 'orders.status can only be changed by a service-role client';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_protect_status on public.orders;
create trigger orders_protect_status
  before insert or update on public.orders
  for each row
  execute procedure public.orders_protect_status();

create or replace function public.stories_protect_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  jwt_role text := coalesce(auth.role(), '');
begin
  if tg_op = 'INSERT' then
    if new.status is distinct from 'pending' and jwt_role not in ('service_role', '') then
      raise exception 'stories.status cannot be set by this session';
    end if;
    return new;
  end if;
  if new.status is distinct from old.status
     and jwt_role not in ('service_role', '') then
    raise exception 'stories.status can only be changed by a service-role client';
  end if;
  return new;
end;
$$;

drop trigger if exists stories_protect_status on public.stories;
create trigger stories_protect_status
  before insert or update on public.stories
  for each row
  execute procedure public.stories_protect_status();
