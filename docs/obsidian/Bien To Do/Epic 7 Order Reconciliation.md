---
title: Epic 7 Order Reconciliation
aliases:
  - Part 2 Epic 3
  - Order Reconciliation
tags:
  - gutguard
  - epic/admin-orders
  - task
---

# Epic 7 — `/admin/orders` Tracking & Maya Webhook Reconcile

Manages product orders, refill pacing, and server-side Maya Checkout reconciliation. Pending vs reconciled must be unmistakable.

**Routes:** `/admin/orders` · Route Handler `/api/webhooks/maya` (name may vary)  
**Files:** `app/admin/orders/page.tsx` · `app/api/webhooks/maya/route.ts` · `lib/actions/admin.ts` · `lib/schemas/order.ts` · `supabase/migrations/`

Locks: [[00 - Locks]] · Board: [[Bien To Do]] · Part: [[02 - Part 2 Admin Management]]

HCI: **Error Handling & Recovery** — dialogue and status prevent financial tracking mistakes.

### Journey

1. Member order sheet stays **mock** in the browser ([[Epic 4 Member Hub]] E4-T11).
2. When Maya exists, Checkout starts on the **server**. Webhook verifies signature.
3. Admin table: pending → paid/reconciled → failed/needs retry.
4. Refill pacing (days left / capsules) sits beside money state.
5. Operator can mark recovered or retry a failed webhook **after** confirm.

### Tasks

- [ ] **E7-T01** Add an `orders` table with explicit money states. `#task #epic/admin-orders`
  - Route: schema
  - HCI: n/a (data).
  - Stack: `public.orders` — `user_id`, qty, amount, `status` check (`pending` · `reconciled` · `failed` · `cancelled`), Maya reference ids, timestamps. RLS default-deny; member may select/insert **own** pending row; status transitions to reconciled only from webhook / admin action. No ORM.
  - Done when: A member cannot `update` their row to `reconciled`.

- [ ] **E7-T02** Render the orders table with labelled states. `#task #epic/admin-orders`
  - Route: `/admin/orders`
  - HCI: Status = [[Components/Badge]] **and** text (`Pending` / `Reconciled` / `Failed`). Never colour-only. Row actions ≥ 44×44. Gold focus. Tabular numerals for amounts.
  - Stack: Server Component; admin dialect; portable CSS [[Components/Table]]; no Tailwind.
  - Done when: An operator can sort pending vs reconciled without opening Maya’s dashboard.

- [ ] **E7-T03** Show refill pacing next to the order (days left, capsules/day). `#task #epic/admin-orders`
  - Route: `/admin/orders`
  - HCI: Pacing is a definition list or secondary cell — not a decoration bar without a label. `aria-label` on any progress rail.
  - Stack: Join `profiles.days_left` + `capsules_per_day` in the same query or a second keyed read. Strict TypeScript.
  - Done when: Operator can see who needs a refill without leaving the table.

- [ ] **E7-T04** Receive Maya webhooks on the server and verify the signature. `#task #epic/admin-orders`
  - Route: `app/api/webhooks/maya/route.ts` (or Edge Function — pick one, document it)
  - HCI: n/a to members. Admin later sees the new status (E7-T02).
  - Stack: Route Handler or Supabase Edge Function. Verify Maya signature with a **server** secret (`MAYA_*`, never `NEXT_PUBLIC_`). Idempotent upsert on Maya payment id. `admin.ts` only if RLS cannot write the transition. No payment UI in the browser.
  - Done when: A replayed webhook does not double-reconcile. Unsigned body is 401/400 and logged.

- [ ] **E7-T05** Make pending vs reconciled a conversation, not a guess. `#task #epic/admin-orders`
  - Route: `/admin/orders`
  - HCI: Filter chips ≥ 44×44; `aria-pressed`; live region announces “12 pending”. Failed rows offer Recover with a [[Components/Dialog]] confirm (`aria-modal`).
  - Stack: Filter via searchParams; Zod-allowed status enum; Server Action for manual recover **after** role re-check.
  - Done when: Operator cannot one-click reconcile without confirm. Confirm copy names the amount and member.

- [ ] **E7-T06** Recover a failed webhook without hiding the failure. `#task #epic/admin-orders`
  - Route: `/admin/orders` action
  - HCI: Failed badge stays until success. `aria-live` “Order … reconciled” or the error. Button stays ≥ 44×44; `aria-busy` while pending; bone-soft + ink-4 when disabled.
  - Stack: Server Action re-validates; writes status + `reconciled_at` + actor id. No client-side status stamp.
  - Done when: Refresh still shows the audit (who recovered, when).

- [ ] **E7-T07** Keep checkout secrets and charges off the client. `#task #epic/admin-orders`
  - Route: member overlay `order` + `/admin/orders`
  - HCI: Member copy still says mock until Maya is live. Admin copy says “webhook” not “paste a card number”.
  - Stack: No Maya keys in Client Components. No `NEXT_PUBLIC_` payment secret. Member Place-order cannot charge a card.
  - Done when: Client bundle has no Maya secret; E4-T11 still holds.

- [ ] **E7-T08** Empty and webhook-down states. `#task #epic/admin-orders`
  - Route: `/admin/orders`
  - HCI: Empty queue ≠ webhook error. [[Components/Alert]] for handler failures (last error time if stored). Retry ≥ 44×44.
  - Stack: Optional `webhook_events` log table (id, payload hash, ok, error). Enough to recover; not a second warehouse.
  - Done when: Operator can tell “no orders yet” from “Maya callback is failing”.
