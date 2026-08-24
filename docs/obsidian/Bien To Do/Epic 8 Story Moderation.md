---
title: Epic 8 Story Moderation
aliases:
  - Part 2 Epic 4
  - Story Moderation
tags:
  - gutguard
  - epic/admin-stories
  - task
---

# Epic 8 — `/admin/stories` Content Moderation Queue

Queue for member-submitted community stories before they appear on member feeds. Bulk approve or reject to cut overhead.

**Route:** `/admin/stories`  
**Files:** `app/admin/stories/page.tsx` · `lib/actions/admin.ts` · `lib/schemas/story-moderate.ts` · `supabase/migrations/`

Locks: [[00 - Locks]] · Board: [[Bien To Do]] · Part: [[02 - Part 2 Admin Management]]

HCI: **Efficiency & Shortcuts** — bulk actions, visible selection, low memory load.

### Journey

1. Member submits via Story share ([[Epic 4 Member Hub]] E4-T07) → status `pending`.
2. Queue lists pending first.
3. Operator selects many rows, Approve or Reject (reject confirms).
4. Member `/app/story` feed reads **approved** only (RLS).
5. Live region reports how many moved.

### Tasks

- [ ] **E8-T01** Add moderation status to `stories`. `#task #epic/admin-stories`
  - Route: schema
  - HCI: n/a (data).
  - Stack: `stories.status` check (`pending` · `approved` · `rejected`), `reviewed_at`, `reviewed_by`. Default `pending`. Member INSERT cannot set `approved`. Replace “select own only” feed policy with: owner sees own; others see `approved`. No ORM.
  - Done when: A member cannot approve their own story through RLS.

- [ ] **E8-T02** Render the moderation queue table. `#task #epic/admin-stories`
  - Route: `/admin/stories`
  - HCI: [[Components/Table]]; pending badge + text; row checkbox ≥ 44×44 (or a 44×44 hit around it); gold focus. Below 900px scroll or cards. Quote text wraps — do not clip the story.
  - Stack: Server Component; admin dialect; portable CSS; lucide outline. **Gutguard** spelling.
  - Done when: Operator can read about / outcomes / consents context without opening a second product.

- [ ] **E8-T03** Filter queue: pending / approved / rejected. `#task #epic/admin-stories`
  - Route: `/admin/stories`
  - HCI: Tabs or chips ≥ 44×44; `aria-current` or `aria-pressed`; count in the tab label. Gold focus.
  - Stack: `searchParams.status`; Zod enum; default `pending`.
  - Done when: Switching filter does not lose the search box value.

- [ ] **E8-T04** Bulk approve and bulk reject. `#task #epic/admin-stories`
  - Route: `/admin/stories` action
  - HCI: Toolbar Approve / Reject ≥ 44×44. Select-all control labelled. Reject opens [[Components/Dialog]] (`aria-modal`) with reason field (`htmlFor`, `aria-describedby`). `aria-busy` on the toolbar while the action runs; do not swap the label for a longer string.
  - Stack: Zod array of ids (cap the batch); Server Action re-checks `lifestyle_is_admin()`; single update. No Tailwind.
  - Done when: One confirm moves N rows. Partial failure is reported, not silent.

- [ ] **E8-T05** Announce the result and keep selection honest. `#task #epic/admin-stories`
  - Route: `/admin/stories`
  - HCI: `aria-live="polite"` — “12 stories approved.” Cleared selection after success. Failed ids stay selected or listed in [[Components/Alert]].
  - Stack: Action return value is a typed `{ ok, count, failedIds }`.
  - Done when: Screen reader and sighted operator get the same count.

- [ ] **E8-T06** Hide unapproved stories from the member feed. `#task #epic/admin-stories`
  - Route: `/app/story`
  - HCI: Member empty state if nothing approved yet — not a flash of pending copy.
  - Stack: RLS / query `status = 'approved'` for community rows; author may still see own pending as “in review”. Server Component — not a client filter alone.
  - Done when: A pending story never appears as community hope text.

- [ ] **E8-T07** Single-row shortcut equals the bulk path. `#task #epic/admin-stories`
  - Route: `/admin/stories`
  - HCI: Per-row Approve / Reject ≥ 44×44; same dialog as bulk reject. Keyboard can reach every control. No hover-only menus.
  - Stack: Same Server Action as E8-T04 with a one-id array. No second code path for status writes.
  - Done when: Row and bulk writes produce the same row shape (`status`, `reviewed_at`, `reviewed_by`).
