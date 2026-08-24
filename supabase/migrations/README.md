# Migrations

Apply in order on the **dev** Supabase project:

1. `20260822000000_lifestyle_member.sql` — profiles, invites, dose logs, BASE, points, stories, RLS, dose-proofs bucket.
2. `20260824000000_unique_invites.sql` — unique invite names per member.
4. `20260824020000_orders_stories_moderation.sql` — `orders`, `payment_events`, story moderation status, protect-status triggers.

Then optionally load `../seed.sql` on development only.

RLS is on for every user-facing table. Members can only read/write their own rows. `lifestyle_base_complete()` is `security invoker` and returns true only when all five BASE steps are done — use it to gate GEMA.

`lifestyle_is_admin()` is `security invoker` and returns true only when the caller’s profile `role` is `admin`. `/admin` uses that RPC with the cookie client. Listing every member at `/admin/users` uses the service-role client in `lib/supabase/admin.ts` because own-row RLS would hide the roster.

Grant the first admin in the SQL editor after they register:

```sql
update public.profiles set role = 'admin' where mobile = '+639xxxxxxxxx';
```

Auth for this product: **name + mobile + password** (wired) + mobile stored on the profile. Phone OTP can replace email when an SMS provider is configured in Supabase Auth.
