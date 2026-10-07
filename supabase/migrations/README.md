# Migrations

Apply in order on the **Staging / dev** Supabase project:

1. `20260822000000_lifestyle_member.sql` — profiles, invites, dose logs, BASE, points, stories, RLS, dose-proofs bucket.
2. `20260825000000_identity_unique.sql` — unique email/mobile, day-zero `days_left` default, `lifestyle_identity_taken()` for register.
3. `20260902000000_lifestyle_admin_rbac.sql` — `app_roles`, `lifestyle_is_admin()`, admin SELECT policies.
4. `20260902010000_lifestyle_orders_stories.sql` — `orders`, `webhook_events`, story moderation status + feed RLS.
5. `20261002000000_prototype_member_page.sql` — Addendum 05: member page fields on `profiles`, the server-field trigger, `lifestyle_mark_guardian()`, `member_requests`. It stops before any change if `app_roles` is missing.
6. `20261003000000_shop_order_sync.sql` — Addendum 05 task 3: a paid website order sets the member's stage, plan and E-Points (`lifestyle_apply_shop_order`, `lifestyle_claim_shop_orders`). Test: `docs/prototype/test_shop_order_sync.sql` on a throwaway database.

Then optionally load `../seed.sql` on development only.

RLS is on for every user-facing table. Members can only read/write their own rows. `lifestyle_base_complete()` gates GEMA / Team invites. `lifestyle_is_admin()` gates `/admin` (middleware + Server Actions). Assign admins only via SQL / service role.

Auth for this product: **email + password** (One Account / Staging). Mobile is stored on the profile. SMS OTP can replace the password path when a provider is configured.

Maya: Route Handler `POST /api/webhooks/maya` verifies `x-maya-signature` HMAC with `MAYA_WEBHOOK_SECRET` (never `NEXT_PUBLIC_`). Member Place-order queues `pending` only — no browser charges.

## Production

Production `rvwseybgimmewuoccecu` already had a slim `public.profiles` table, so these CREATE-TABLE files were **not** applied there via `db push`. The additive SQL that was applied on 2026-09-12 is recorded in `../patches/20260912_production_additive.sql`.

Do not insert Academy versions `20260911153000` / `20260911153500` / `20260911154500` into `supabase_migrations.schema_migrations`. Those belong to `academy.applied_migrations`.

### Addendum 05 on Production

`20261002000000_prototype_member_page.sql` is additive (`add column if not exists`, `create or replace`, `create table if not exists`), so on Production it is pasted into the SQL editor, like the 2026-09-12 patch. It is **not** applied with `db push`, and no row is added to `schema_migrations`. Record it in `../patches/README.md`. Check with `../patches/20261002_prototype_member_page_check.sql`. Undo with `../patches/20261002_prototype_member_page_rollback.sql` (deletes the new data; export first).

