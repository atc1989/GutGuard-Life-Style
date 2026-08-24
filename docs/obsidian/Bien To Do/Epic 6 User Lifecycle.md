---
title: Epic 6 User Lifecycle
aliases:
  - Part 2 Epic 2
  - User Lifecycle
tags:
  - gutguard
  - epic/admin-users
  - task
---

# Epic 6 — `/admin/users` Lifecycle & Profile Audit

Searchable, filterable table of member profiles, registration status, and mobile. Operators audit who unlocked BASE or GEMA.

**Route:** `/admin/users`  
**Files:** `app/admin/users/page.tsx` · `lib/actions/admin.ts` · `supabase/migrations/`

Locks: [[00 - Locks]] · Board: [[Bien To Do]] · Part: [[02 - Part 2 Admin Management]]

HCI: **Visibility & Control** — progression is visible. Operator does not hold BASE/GEMA state in working memory.

### Journey

1. Table loads only after Epic 5 gate.
2. Search name or mobile. Filter phase / claimed / BASE / GEMA.
3. Columns: name, mobile, registered, claimed, BASE complete, GEMA unlocked.
4. Row opens a read-only audit (no silent privilege change).
5. Empty and error states are labelled.

### Tasks

- [ ] **E6-T01** Let an admin **select** every profile the member policies hide. `#task #epic/admin-users`
  - Route: schema + server read
  - HCI: n/a until the table ships (E6-T02).
  - Stack: Admin SELECT policy using `lifestyle_is_admin()` **or** a Server Action that uses `admin.ts` after the role re-check. Members keep own-row RLS. No ORM. Migration in `supabase/migrations/`.
  - Done when: A member session cannot `select` another profile; an admin action can.

- [ ] **E6-T02** Render the users table in admin dialect. `#task #epic/admin-users`
  - Route: `/admin/users`
  - HCI: [[Components/Table]] — uppercase header, badge status (not row colour fills), gold focus on actions. Below 900px: horizontal scroll **or** cardized rows; actions stay ≥ 44×44. Never drop mobile / BASE without a drill-in.
  - Stack: App Router Server Component; portable CSS; no Tailwind; typed rows from PostgREST.
  - Done when: Columns stay legible in the ~440px column via scroll or cards.

- [ ] **E6-T03** Search by name or mobile without making the operator remember IDs. `#task #epic/admin-users`
  - Route: `/admin/users`
  - HCI: Search field ≥ 44px tall; `label` + `htmlFor`; `aria-describedby` for pattern hint; submit/clear ≥ 44×44; gold focus. Result count in an `aria-live="polite"` region.
  - Stack: Zod on the query string or action input; re-validate on the server; `ilike` in Supabase filter — no ORM.
  - Done when: Empty search shows all (paged). Bad pattern fails in the field, not a white screen.

- [ ] **E6-T04** Filter registration / claimed / BASE / GEMA. `#task #epic/admin-users`
  - Route: `/admin/users`
  - HCI: Filter controls ≥ 44×44; `aria-pressed` or native selected option; active filters are visible chips/text, not colour-only. Disabled unused filters use bone-soft + ink-4 (not opacity).
  - Stack: Query params on the Server Component; BASE via `lifestyle_base_complete(user_id)`; GEMA unlocked = BASE complete (same RPC). Strict TypeScript unions for filter values.
  - Done when: An operator can list “BASE done, GEMA still locked” without opening each row. (If GEMA lock **is** BASE complete, the filter copy says so — do not invent a second flag.)

- [ ] **E6-T05** Show mobile and registration status as facts. `#task #epic/admin-users`
  - Route: `/admin/users`
  - HCI: Mobile is selectable text. Status is a [[Components/Badge]] plus text. No hover-only reveal of credentials.
  - Stack: Read `profiles.mobile`, `created_at`, `phase`, `claimed`. Never render email OTP secrets. **Gutguard** spelling.
  - Done when: A support call can confirm the member from the table without opening Auth admin.

- [ ] **E6-T06** Row drill-in for one member (read-only audit). `#task #epic/admin-users`
  - Route: `/admin/users` · `/admin/users/[id]` or dialog
  - HCI: Row action ≥ 44×44 with an accessible name; dialog `aria-modal` + labelled title if overlay; gold focus on close. Reduced-motion on the sheet.
  - Stack: Server Component or Server Action; same role re-check; no client-only “isAdmin”.
  - Done when: Operator sees BASE steps 0–4 and claimed/points without writing a privilege.

- [ ] **E6-T07** Empty, loading, and error states that do not look like “no members exist” when the query failed. `#task #epic/admin-users`
  - Route: `/admin/users`
  - HCI: [[Components/Empty State]] vs [[Components/Alert]] are distinct. Loading uses `aria-busy` on the table region. Retry ≥ 44×44.
  - Stack: Surface Supabase errors as calm copy in the Server Component; log details server-side.
  - Done when: A downed project shows an error alert, not a blank “0 members” table.
