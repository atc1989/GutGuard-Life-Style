# Production patches (not the CLI apply-log)

Official Lifestyle migration history remains `supabase_migrations.schema_migrations`.

That ledger is a **historical shared-project series**. It is not rewritten to match Academy Change 8 versions, and it is not rewritten to silence `supabase db push` divergence.

## `20260912_production_additive.sql`

Applied to Production `rvwseybgimmewuoccecu` on 2026-09-12 by targeted SQL during Gentrep Change 8 cutover.

What it added on the existing slim `public.profiles` table:

- Lifestyle member columns (`name`, `mobile`, `card_no` nullable, points/phase/role, …)
- Lifestyle tables: `invites`, `dose_logs`, `base_progress`, `point_events`, `stories`, `app_roles`, `orders`, `webhook_events`
- RPCs: `lifestyle_identity_taken`, `lifestyle_is_admin`, `lifestyle_base_complete`
- RLS policies, grants, `dose-proofs` bucket

What it did **not** do:

- replace `public.profiles`
- replace Auth triggers (`on_auth_user_created`, `zz_gutguard_on_auth_user_created`)
- rewrite `public.handle_new_user` (it still writes `gema.profiles` only)
- mint cards or backfill member history
- insert Academy versions `20260911153000` / `153500` / `154500` into `schema_migrations`
- `supabase db push`

### How to use this file

- **New empty database:** prefer `supabase/migrations/` in order (see that README).
- **Production:** already applied. Do not re-run unless an operator has proven specific objects are missing.
- **Staging:** member columns/tables/functions already exist. Staging is missing `public.app_roles` and `public.webhook_events` relative to Production. That is recorded drift, not a reason to `db push` or to insert fabricated migration rows.

### Equivalence to repo migrations

| Repo migration | Production equivalent |
|---|---|
| `20260822000000_lifestyle_member.sql` | Additive `ALTER`/`CREATE TABLE IF NOT EXISTS` in this patch (cannot `CREATE TABLE public.profiles` on Production) |
| `20260825000000_identity_unique.sql` | Unique indexes + `lifestyle_identity_taken` in this patch |
| `20260902000000_lifestyle_admin_rbac.sql` | `app_roles` + `lifestyle_is_admin` + admin SELECT policies |
| `20260902010000_lifestyle_orders_stories.sql` | `orders`, `webhook_events`, story moderation columns/policies |

The CREATE-TABLE migrations assume an empty Lifestyle-shaped `public.profiles`. They are **not** an exact apply-log of Production.

### Official Production ledger (do not “fix”)

Production `supabase_migrations.schema_migrations` (21 rows, latest `20260827065245`) is the pre-Lifestyle shared-project series. Academy Change 8 versions are tracked in `academy.applied_migrations`, never here.

Staging’s ledger is a different 25-row historical series (latest `20260827065241`). Same rule: do not insert Academy versions there.
