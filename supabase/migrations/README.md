# Migrations

Apply in order on the **Staging / dev** Supabase project:

1. `20260822000000_lifestyle_member.sql` — profiles, invites, dose logs, BASE, points, stories, RLS, dose-proofs bucket.
2. `20260825000000_identity_unique.sql` — unique email/mobile, day-zero `days_left` default, `lifestyle_identity_taken()` for register.
3. `20260902000000_lifestyle_admin_rbac.sql` — `app_roles`, `lifestyle_is_admin()`, admin SELECT policies.
4. `20260902010000_lifestyle_orders_stories.sql` — `orders`, `webhook_events`, story moderation status + feed RLS.

Then optionally load `../seed.sql` on development only.

RLS is on for every user-facing table. Members can only read/write their own rows. `lifestyle_base_complete()` gates GEMA / Team invites. `lifestyle_is_admin()` gates `/admin` (middleware + Server Actions). Assign admins only via SQL / service role.

Auth for this product: **email + password** (One Account / Staging). Mobile is stored on the profile. SMS OTP can replace the password path when a provider is configured.

Maya: Route Handler `POST /api/webhooks/maya` verifies `x-maya-signature` HMAC with `MAYA_WEBHOOK_SECRET` (never `NEXT_PUBLIC_`). Member Place-order queues `pending` only — no browser charges.
