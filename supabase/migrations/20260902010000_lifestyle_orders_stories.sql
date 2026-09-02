-- Orders + Maya webhook log + story moderation status.

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  qty integer not null check (qty between 1 and 6),
  amount_pesos integer not null check (amount_pesos > 0),
  status text not null default 'pending'
    check (status in ('pending', 'reconciled', 'failed', 'cancelled')),
  maya_payment_id text,
  maya_checkout_id text,
  notes text,
  reconciled_at timestamptz,
  reconciled_by uuid references auth.users (id),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists orders_maya_payment_id_uidx
  on public.orders (maya_payment_id)
  where maya_payment_id is not null;

alter table public.orders enable row level security;

create policy orders_select_own on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.lifestyle_is_admin());

create policy orders_insert_own_pending on public.orders
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reconciled_at is null
    and reconciled_by is null
  );

-- Members may cancel their own pending rows only — never set reconciled.
create policy orders_update_own_cancel on public.orders
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (
    user_id = auth.uid()
    and status = 'cancelled'
    and reconciled_at is null
    and reconciled_by is null
  );

create policy orders_update_admin on public.orders
  for update to authenticated
  using (public.lifestyle_is_admin())
  with check (public.lifestyle_is_admin());

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'maya',
  payload_hash text not null,
  ok boolean not null default false,
  error text,
  maya_payment_id text,
  created_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

create policy webhook_events_select_admin on public.webhook_events
  for select to authenticated
  using (public.lifestyle_is_admin());

-- Inserts come from service role / Route Handler with admin client.

-- ---------------------------------------------------------------------------
-- Stories moderation
-- ---------------------------------------------------------------------------
alter table public.stories
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'));

alter table public.stories
  add column if not exists reviewed_at timestamptz;

alter table public.stories
  add column if not exists reviewed_by uuid references auth.users (id);

alter table public.stories
  add column if not exists reject_reason text;

drop policy if exists stories_all_own on public.stories;

create policy stories_select_feed on public.stories
  for select to authenticated
  using (
    user_id = auth.uid()
    or status = 'approved'
    or public.lifestyle_is_admin()
  );

create policy stories_insert_own_pending on public.stories
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
  );

create policy stories_update_admin on public.stories
  for update to authenticated
  using (public.lifestyle_is_admin())
  with check (public.lifestyle_is_admin());
