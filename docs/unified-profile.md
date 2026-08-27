# Unified profile — GutGuard Lifestyle implications

Canonical spec (problem, target schema, migration, owner decisions) lives in the **gema** repo:

`docs/unified-profile.md` on branch `cursor/unified-profile-database-6a0d`, then `main` after merge.

https://github.com/atc1989/gema/blob/cursor/unified-profile-database-6a0d/docs/unified-profile.md

This note is only what Lifestyle must change so one GutGuard person can use GEMA, Academy, and Lifestyle without three accounts.

House spelling in UI copy stays **Gutguard**.

---

## What is broken today

Lifestyle Auth is not the GEMA Auth set.

- Production GEMA lives on Supabase project `rvwseybgimmewuoccecu` (dashboard name “GutGuard Life Style”, 431 `auth.users`, `gema.profiles` only — **no** Lifestyle `public.profiles`).
- GutGuard Staging `fxdsnacuonfvutdquogb` already mixed Lifestyle tables (`public.profiles`, `dose_logs`, `base_progress`, …) with `gema.*`.
- When env is empty, this app uses a `localStorage` mock session. That person does not exist in any database.

`public.profiles` is a wide product row, not a person:

`name`, `mobile`, `email` (identity) sit next to `card_no`, `phase`, `claimed`, `points`, `pending`, `banked`, `days_left`, `capsules_per_day`, `sponsor`, `team`.

Register upserts all of that onto `profiles`. Epic 5 already forbids putting an admin role on a self-updatable profile column — unification makes that a hard schema rule (`identity.roles`, service-role writes only).

README still says email OTP; `lib/actions/auth.ts` signs up with email + password. Shared Auth will be email + password in v1 (same as GEMA and Academy). SMS OTP stays later, on the shared project, not as a second user table.

---

## Target split for this repo

| Stays Lifestyle-local (`lifestyle.members` or equivalent) | Moves to `identity.profiles` | Entitlement |
| --- | --- | --- |
| `card_no`, `phase`, `claimed`, points, capsules, `days_left`, `sponsor`, `team`, welcome/telegram/facebook flags | `name` → `full_name`, `mobile` → `phone`, `email` | `identity.product_access` row for `lifestyle` |

Dose logs, BASE progress, invites, stories, proofs keep `user_id → identity.profiles.id`.

`lifestyle_base_complete()` stays a Lifestyle rule. Completing BASE does **not** create a GEMA `members` row and does **not** enrol Academy. It only unlocks the in-app GEMA surface in this product, as today.

---

## Required code changes (later PRs)

1. Point env at the shared Staging project, then the identity home. Mock session is UI-only until then; it must not ship against real Auth.
2. Register: Auth signup → `identity.profiles` (trigger) → grant `product_access(lifestyle)` → insert Lifestyle member/card row. Do not insert Academy ranks or GEMA members.
3. Unique mobile stays, but uniqueness lives on `identity.profiles.phone` (E.164). `lifestyle_identity_taken` should read identity, not a product table.
4. Settings that change name or mobile write identity once; GEMA and Academy see the same person after they cut over.
5. Door card / claimed / points stay Lifestyle writes under RLS.
6. Default D4: Lifestyle self-register may create a **new** identity. It must not require a GEMA distributor login unless the owner says otherwise.

---

## Do not do in this pass

- Apply identity SQL to production
- Treat the production project named “GutGuard Life Style” as empty — it is GEMA’s 431 users
- Copy GEMA Tailwind/shadcn into this repo
- Put `role` on a member-updatable Lifestyle profile
