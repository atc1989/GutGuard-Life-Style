---
title: Epic 5 Admin RBAC
aliases:
  - Part 2 Epic 1
  - Admin RBAC
tags:
  - gutguard
  - epic/admin
  - task
---

# Epic 5 — `/admin/*` RBAC Middleware & Security

Protects administrative routes with server-side RBAC. Unauthenticated or non-admin users redirect immediately. The app does not crash; tables never flash.

**Routes:** `/admin` · `/admin/users` · `/admin/orders` · `/admin/stories`  
**Files:** `middleware.ts` · `lib/supabase/middleware.ts` · `lib/supabase/admin.ts` · `lib/supabase/server.ts` · `app/admin/layout.tsx` · `supabase/migrations/`

Locks: [[00 - Locks]] · Board: [[Bien To Do]] · Part: [[02 - Part 2 Admin Management]]

HCI: **Predictability & Security** — system boundary is obvious. Unauthorized users get a calm fallback.

### Journey

1. Operator signs in with a cookie session (same Auth as members).
2. Role lives where the member **cannot** write it (`app_roles` or `app_metadata` via service role — not a column on self-update `profiles`).
3. Middleware: `getUser()` then `lifestyle_is_admin()`. Fail → `/`.
4. Every Server Action repeats the role check.
5. Shell is admin dialect: hero + tabs, radius 0.

### Tasks

- [ ] **E5-T01** Store admin role so a member cannot self-escalate. `#task #epic/admin`
  - Route: schema (`supabase/migrations/`)
  - HCI: Operators never see a “make me admin” control on `/app/*`.
  - Stack: New `public.app_roles` (or Auth `app_metadata.role`) with **no** member INSERT/UPDATE policy; assign only via `admin.ts` / SQL. RPC `lifestyle_is_admin()` `security invoker`. Do not add `profiles.role` if members can update their own row. No ORM.
  - Done when: A crafted profile update cannot grant admin. RLS default-deny on `app_roles`.

- [ ] **E5-T02** Gate every `/admin` route in middleware. `#task #epic/admin`
  - Route: `/admin`, `/admin/users`, `/admin/orders`, `/admin/stories`
  - HCI: No flash of admin chrome or tables. Redirect is immediate.
  - Stack: Root `middleware.ts` + `@supabase/ssr` `getUser()` (not `getSession()` as auth). Then role check. Cookie `getAll`/`setAll`. Next.js App Router only.
  - Done when: No cookie → 307 `/`. Cookie without admin role → 307 `/`. Valid admin → `/admin/*`.

- [ ] **E5-T03** Re-check admin role in every privileged Server Action. `#task #epic/admin`
  - Route: Server Actions under `lib/actions/admin.ts`
  - HCI: Failed check returns a calm form/action error (`aria-live`), not a stack dump.
  - Stack: `"use server"`; `createClient()` from `lib/supabase/server.ts`; call `lifestyle_is_admin()` again. Middleware hide is not enough ([[02 - Supabase Conventions]]).
  - Done when: A forged POST from a member session cannot list users, reconcile an order, or moderate a story.

- [ ] **E5-T04** Unauthorized fallback is a safe public route — no crash. `#task #epic/admin`
  - Route: `/admin/*` → `/`
  - HCI: Member sees the landing they already know. No “forbidden” admin skin. No blank error page.
  - Stack: `redirect("/")` from middleware / layout. Missing env does not throw through the HTML shell — log server-side, send the guest home.
  - Done when: A non-admin hitting `/admin/users` never sees a table and the app stays up.

- [ ] **E5-T05** Frame `/admin` with Admin Shell — hero + tabs, one dialect. `#task #epic/admin`
  - Route: `/admin` layout
  - HCI: Tabs ≥ 44×44; `aria-current="page"`; gold `:focus-visible`; uppercase micro-labels. Close/nav controls not opacity-disabled.
  - Stack: `app/admin/layout.tsx`; portable CSS admin tokens (radius **0**); [[Components/Admin Shell]] + [[Components/Tabs]]; lucide outline icons; no Tailwind; no commerce pill mix.
  - Done when: Users / Orders / Stories are keyboard-reachable on ~440px and ≥900px. Hero can stack on small viewports.

- [ ] **E5-T06** Keep `admin.ts` server-only. `#task #epic/admin`
  - Route: server modules only
  - HCI: n/a (no UI).
  - Stack: `lib/supabase/admin.ts` uses `SUPABASE_SERVICE_ROLE_KEY`. Never `NEXT_PUBLIC_`. Never import from a `"use client"` file. Prefer cookie + RLS/`lifestyle_is_admin()` for reads; service role only when RLS cannot express the elevation.
  - Done when: A client bundle search shows no service-role key and no `createAdminClient` import.

- [ ] **E5-T07** `/admin` index points at the three work queues. `#task #epic/admin`
  - Route: `/admin`
  - HCI: Three links/cards ≥ 44×44; gold focus; copy states what the operator will do (users / orders / stories).
  - Stack: Server Component; admin dialect; **Gutguard** spelling.
  - Done when: An operator can start any of the three modules without guessing the URL.
