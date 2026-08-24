-- Prevent duplicate invite rows for the same member + name.
create unique index if not exists invites_user_name_key
  on public.invites (user_id, name);
