# Migrations

Apply in order on the **dev** Supabase project:

1. `20260822000000_lifestyle_member.sql` — profiles, invites, dose logs, BASE, points, stories, RLS, dose-proofs bucket.
2. `20260825000000_identity_unique.sql` — unique email/mobile, day-zero `days_left` default, `lifestyle_identity_taken()` for register.

Then optionally load `../seed.sql` on development only.

RLS is on for every user-facing table. Members can only read/write their own rows. `lifestyle_base_complete()` is `security invoker` and returns true only when all five BASE steps are done — use it to gate GEMA.

Auth for this product: **email OTP** (wired) + mobile stored on the profile. Phone OTP can replace email when an SMS provider is configured in Supabase Auth.
