---
title: Change 9 - Member chrome identity
aliases:
  - Change 9
tags:
  - gutguard
  - one-account
  - change
---

# Change 9 — Member chrome identity

**Status:** **planned / ready for implementation** — not coded. Planned 2026-09-12.

**Current change** on this board. Gentrep Academy Change 8 stays **CLOSED**.

Engineering plan (do not implement from memory): Academy repo `docs/change9-plan.md`.

Read [[00 - Session gate]], [[00 - Locks]], [[01 - Decisions]], [[04 - UX]] before implementing. This Change **touches UI** — read the Design System (OWNER, Visual Foundations, Dialects, Portable CSS). Tech Stack: OWNER, Canonical, Frontend, Supabase, Deploy.

## Goal

When a signed-in member opens Lifestyle `/app/*` against real Supabase, the shell (masthead / avatar / account sheet / QR) shows that member’s name, sponsor, and minted card from `public.profiles`, using the same metadata fallback `/card` already uses. Saving name/mobile in Settings updates the chrome. The client session stays a **guest** session whenever Supabase is configured.

## Why this is Change 9

Academy Changes 1–8 (streamline + Production cutover) are done. One Account Changes 1–6b are done. The only named leftover on this board was Change 5’s unfixed chrome (“still says Member”). During Change 8 that leftover was labelled “own Change, not Academy Change 9” so it would not ride the cutover. It is now the next numbered increment on both boards. There is no One Account Change 7 or 8.

Owning repo: **`atc1989/GutGuard-Life-Style`**. Academy and GEMA application code are not in scope.

## Work (implementation session)

- [ ] Branch from Lifestyle `origin/main` (Settings name/mobile already there). Do not start from Settings-less `staging` HEAD.
- [ ] Server-read `public.profiles` in `app/app/layout.tsx` after `ensureCardForCurrentUser()`. User-scoped client only.
- [ ] Pass chrome into `MemberShell` → account card/menu, account sheet, QR overlay.
- [ ] `saveProfile` revalidates `/app` layout. Do not revive `localStorage` as authorization.
- [ ] Tests T-910–T-922. Staging Preview T-914–T-923. Production read-only T-924.
- [ ] No SQL. No `db push`. Do not apply `20260911153100` / `20260911154000`. Do not create Staging `app_roles` / `webhook_events`.

## Non-goals

Academy training features, GEMA, cookies/Auth/domains, Production operator provisioning, Production Academy events catalog, Health/Team/Story content hydration, Bien `/admin`.

## Owner steps in

None to start implementation. Staging Preview still needs Vercel SSO. Production Settings **write** stays off real members unless the owner later names a disposable Production fixture. Copy this folder to Najee’s vault when convenient.

## Done when

A Staging member with a filled `public.profiles` row sees their name and card on `/app/*` chrome (not `"Member"` / empty QR), Settings save updates that chrome, guest-lock tests still pass, `/card` still matches, spokes still open signed-in. Then the same read-only proof on Production Lifestyle.

## Next

Do not invent Change 10 from this note. Re-read the board after Change 9 ships.
