-- Unique member identity + day-zero defaults.
-- lifestyle_identity_taken is boolean-only so register can reject duplicates
-- before Auth signUp (which otherwise returns a fake success for existing emails).

alter table public.profiles
  alter column days_left set default -1;

create unique index if not exists profiles_email_lower_uidx
  on public.profiles (lower(email))
  where email is not null and length(btrim(email)) > 0;

create unique index if not exists profiles_mobile_uidx
  on public.profiles (mobile);

create or replace function public.lifestyle_identity_taken(p_email text, p_mobile text)
returns table(email_taken boolean, mobile_taken boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles
      where email is not null
        and lower(email) = lower(p_email)
    ),
    exists (
      select 1
      from public.profiles
      where mobile in (
        p_mobile,
        case
          when p_mobile like '+63%' then '0' || substring(p_mobile from 4)
          else p_mobile
        end,
        case
          when p_mobile like '09%' then '+63' || substring(p_mobile from 2)
          else p_mobile
        end
      )
    );
$$;

revoke all on function public.lifestyle_identity_taken(text, text) from public;
grant execute on function public.lifestyle_identity_taken(text, text) to anon, authenticated;
