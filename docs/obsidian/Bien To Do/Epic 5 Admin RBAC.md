---
title: Epic 5 Admin RBAC
tags:
  - gutguard
  - epic/admin
  - task
---

# Epic 5 — Admin RBAC & security middleware

`/admin/*` is an operator desk. Members cannot open it. The gate is the cookie session plus `lifestyle_is_admin()`, not a hidden button.

**Routes:** `/admin` · `/admin/users` · `/denied`  
**Files:** `proxy.ts` · `lib/supabase/middleware.ts` · `lib/admin/guard.ts` · `app/admin/layout.tsx` · `app/denied/page.tsx` · `supabase/migrations/20260824010000_admin_rbac.sql`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Cookie `getUser()` in `proxy.ts`. No session → `/denied?reason=signed-out`.
2. `lifestyle_is_admin()` on the caller’s own profile. False or RPC error → `/denied?reason=forbidden`.
3. `app/admin/layout.tsx` repeats the same gate (defense in depth).
4. Service role is **not** used to decide who may enter. It is used later to list rows.

### Tasks

- [x] **E5-T01** Add `profiles.role` (`member` | `admin`) with a trigger so members cannot self-promote. `#task #epic/admin`
  - Stack: Migration only; default `member`; SQL editor or service-role client grants the first admin.
  - Done when: An authenticated upsert cannot set `role = 'admin'`.

- [x] **E5-T02** Expose `lifestyle_is_admin()` as `security invoker` for the cookie client. `#task #epic/admin`
  - Stack: Grant execute to `authenticated` only. Proxy and layout call it after `getUser()`.
  - Done when: A member JWT cannot pass the admin gate.

- [x] **E5-T03** Refuse `/admin/*` in `proxy.ts` with a calm, labelled fallback. `#task #epic/admin`
  - HCI: Predictable redirect, never a crash. Copy on `/denied` explains signed-out vs operator-only. CTAs ≥ 44×44. Gold focus.
  - Stack: Anon cookie client only. No `SUPABASE_SERVICE_ROLE_KEY` in the proxy.
  - Done when: Signed-out → `signed-out`; member → `forbidden`; admin continues.

- [x] **E5-T04** Keep `lib/supabase/admin.ts` server-only. `#task #epic/admin`
  - Stack: `import "server-only"`; key never `NEXT_PUBLIC_`. Directory fetch lives in a `"use server"` module.
  - Done when: Client bundles cannot import the service-role client.
