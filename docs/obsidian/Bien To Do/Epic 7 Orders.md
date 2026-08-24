---
title: Epic 7 Orders
tags:
  - gutguard
  - epic/admin
  - task
---

# Epic 7 — Order tracking & webhook reconciliation

Members queue bottles. Maya Checkout or a bank callback confirms them. The browser never sees payment secrets.

**Routes:** `/admin/orders` · `POST /api/payments/webhook`  
**Files:** `lib/payments/*` · `lib/actions/orders.ts` · `app/api/payments/webhook/route.ts` · `app/admin/orders/page.tsx` · `supabase/migrations/20260824020000_orders_stories_moderation.sql`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Member taps Queue order. Server Action inserts `orders.status = pending`. Amount is computed on the server.
2. Maya or the bank POSTs to `/api/payments/webhook`.
3. The handler verifies HMAC (`PAYMENTS_WEBHOOK_SECRET`) and/or IP allowlist (`PAYMENTS_WEBHOOK_IPS`), parses with Zod, and is idempotent on `(provider, event id)`.
4. Matching reference + amount → **Reconciled**. Mismatch or provider failure → **Failed** with a readable reason. Unknown reference stays unmatched, never invents an order.
5. Operators read the desk. Pending / Reconciled / Failed are labelled, not colour-only.

### Tasks

- [x] **E7-T01** Persist queued orders under RLS. `#task #epic/orders`
- [x] **E7-T02** Webhook route handler, server-only secrets, no browser payments. `#task #epic/orders`
- [x] **E7-T03** Admin table with clear states and unmatched-webhook recovery copy. `#task #epic/orders`
