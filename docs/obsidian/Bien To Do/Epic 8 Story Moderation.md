---
title: Epic 8 Story Moderation
tags:
  - gutguard
  - epic/admin
  - task
---

# Epic 8 — Community story moderation queue

Stories wait in `/admin/stories` until an operator approves or flags them. Only **approved** rows appear on `/app/story`.

**Routes:** `/admin/stories` · `/app/story`  
**Files:** `components/admin/ModerationQueue.tsx` · `lib/actions/stories.ts` · `lib/member-data.ts` · `app/admin/stories/page.tsx`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Member signs a story. Insert is `status = pending`. Toast: sent for review.
2. Operator opens the pending queue. Checkboxes and row actions are ≥ 44×44.
3. Approve or flag one row, or bulk-select then Approve selected / Flag selected.
4. Approved stories populate My Story. Flagged stay off the feed. Authors still see their own row as In review / Flagged / Approved.

### Tasks

- [x] **E8-T01** `stories.status` with a trigger so members cannot self-approve. `#task #epic/stories`
- [x] **E8-T02** Feed reads approved rows only (plus the author’s own). `#task #epic/stories`
- [x] **E8-T03** Queue with bulk actions, gold focus, pending-first filter. `#task #epic/stories`
