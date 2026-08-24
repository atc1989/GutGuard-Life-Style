---
title: Epic 6 User Lifecycle
tags:
  - gutguard
  - epic/admin
  - task
---

# Epic 6 — `/admin/users` lifecycle table

Operators scan members the way a desk clerk scans a roster: name, mobile, registration, BASE, GEMA. Search and filters are the work, not decoration.

**Route:** `/admin/users`  
**Files:** `app/admin/users/page.tsx` · `components/admin/*` · `lib/actions/admin.ts` · `lib/admin/search.ts` · `lib/schemas/admin.ts`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Land on Users. Count is announced (`aria-live`).
2. Search by name, mobile, or card number (GET, shareable).
3. Filter: registered, claimed, active, BASE done, GEMA open, admins.
4. Read BASE `x / 5` and GEMA Open/Locked from `base_progress` (GEMA unlocks when BASE is complete).

### Tasks

- [x] **E6-T01** Fetch the directory on the server through the service-role client. `#task #epic/admin`
  - Stack: `"use server"` `loadMemberDirectory` in `lib/actions/admin.ts` imports `createAdminClient()`. RLS own-row would hide everyone else. No ORM.
  - HCI: Missing key or query failure shows a labelled error, not a crash. Empty env uses a labelled preview table.
  - Done when: An admin sees every profile; a member still cannot open `/admin`.

- [x] **E6-T02** High-density table with clear labels and 44×44 controls. `#task #epic/admin`
  - HCI: Search submit and filter chips ≥ 44×44; gold `:focus-visible`; uppercase column headers; horizontal scroll on a phone.
  - Stack: Admin dialect (square radii). Portable CSS only. Zod parses `q` and `filter`.
  - Done when: Keyboard can search, filter, and read BASE/GEMA without a pointer.
