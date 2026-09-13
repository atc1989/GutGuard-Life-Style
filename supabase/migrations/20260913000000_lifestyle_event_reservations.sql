-- Lifestyle event reservations. Product data only — not the shared One Account person row.

create table if not exists public.event_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_slug text not null,
  kind text not null check (kind in ('reserved', 'waitlist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_slug)
);

alter table public.event_reservations enable row level security;

create policy event_reservations_all_own on public.event_reservations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
