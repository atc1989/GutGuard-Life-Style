-- Minimal Supabase stubs so the real migrations run unmodified on a plain
-- Postgres. Not a model of Supabase — only the objects the migrations touch.
create role anon;
create role authenticated;
create role service_role;

create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create schema storage;
create table storage.buckets (id text primary key, name text, public boolean default false);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text
);
alter table storage.objects enable row level security;

-- The GEMA identity spine, as one-account/provision.ts writes it.
create schema gema;
create table gema.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, avatar_url text,
  role text default 'member', is_admin boolean default false,
  last_seen_at timestamptz
);
