---
title: Epic 4 Member Hub
tags:
  - gutguard
  - epic/member
  - task
---

# Epic 4 — `/app/*` Member Hub & BASE gating

The member lives in Health / Team / Story. **My Team** and **GEMA** stay closed until BASE Activation is complete. Middleware refuses `/app` without a cookie session.

**Routes:** `/app` · `/app/health` · `/app/team` · `/app/story`  
**Sheets:** Order · Settings · BASE · GEMA · GG-VERSE · Story share · QR · Invite picker  
**Files:** `app/app/*` · `middleware.ts` · `lib/supabase/middleware.ts` · `components/shell/*` · `components/overlays/*` · `lib/actions/member.ts` · `supabase/migrations/`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Cookie gate: no session → `/`.
2. Welcome into My Health: doses, supply, BASE badge.
3. BASE drawer: five steps; events to book.
4. Team roster unlocks only when all five BASE steps are done.
5. GEMA locked by UI **and** `lifestyle_base_complete()` (RLS / RPC).
6. Story share with consent; order sheet stays mock (no browser payments).

### Tasks

- [ ] **E4-T01** Protect every `/app` route in middleware with a validated cookie session. `#task #epic/member`
  - Route: `/app`, `/app/health`, `/app/team`, `/app/story`
  - HCI: Unauthenticated users never see a flash of member chrome; redirect is immediate.
  - Stack: Root `middleware.ts` + `createServerClient` from `@supabase/ssr`; `getUser()` (not `getSession()`) to refresh tokens; `getAll`/`setAll` cookies; redirect to `/`.
  - Done when: No cookie → 307 `/`; valid cookie → hub; tokens refresh on public routes too.

- [ ] **E4-T02** Frame the hub: sidebar (≥900px), masthead, mobile segmented nav, commerce bottom bar. `#task #epic/member`
  - Route: `/app/*`
  - HCI: Nav links and icon buttons ≥ 44×44; `aria-current="page"` or `is-active` plus accessible name; gold focus; bottom bar does not cover toasts.
  - Stack: App Router layout `app/app/layout.tsx`; portable CSS commerce dialect; lucide outline icons.
  - Done when: Health / Team / Story are reachable by keyboard on mobile and desktop.

- [ ] **E4-T03** My Health: log today’s doses, attach proof, see days of supply. `#task #epic/member`
  - Route: `/app/health`
  - HCI: Log / Taken buttons ≥ 44×44; `aria-pressed` or distinct text for taken vs log; file picker labelled; gold focus; `aria-live` for proof saved.
  - Stack: Server Actions write `dose_logs` + Storage under RLS; Zod not required for booleans but types stay strict; no ORM.
  - Done when: Refresh keeps the log when Supabase env is set; mock path is clearly non-authoritative.

- [ ] **E4-T04** BASE Activation sheet: five steps with visible done state. `#task #epic/member`
  - Route: overlay `base` from `/app/*`
  - HCI: Step toggles ≥ 44×44; `aria-pressed` / checkbox semantics; drawer `aria-modal`; gold focus on close and book actions; reduced-motion on sheet.
  - Stack: Persist `base_progress` via Server Action; steps 0–4; no client-only lock for GEMA.
  - Done when: Toggling a step survives reload; event “Reserved” is announced.

- [ ] **E4-T05** Gate **My Team** until BASE is complete. `#task #epic/member`
  - Route: `/app/team`
  - HCI: Empty state CTA ≥ 44×44; does not look disabled-via-opacity; gold focus; copy explains the lock.
  - Stack: Client may hide roster; **server** still enforces via `lifestyle_base_complete()` / RLS — not UI hiding alone.
  - Done when: Incomplete BASE cannot invite through a Server Action; complete BASE shows roster + invite picker.

- [ ] **E4-T06** Invite picker: search contacts, send invite, pending points. `#task #epic/member`
  - Route: overlay from `/app/team`
  - HCI: Search field 44px tall; row actions ≥ 44×44; `aria-invalid` if search pattern added; live region for “Invite sent”.
  - Stack: `invites` + `point_events` inserts under RLS; Zod if free-text names are collected; portable CSS commerce sheet.
  - Done when: Duplicate invites don’t double-write; pending vs real points are distinct in the ledger.

- [ ] **E4-T07** My Story: community quotes + share wizard with consent. `#task #epic/member`
  - Route: `/app/story`
  - HCI: Share CTA ≥ 44×44; outcome chips ≥ 44×44; consents are real checkboxes with labels; `aria-invalid` on missing required fields; gold focus.
  - Stack: Zod + RHF in `lib/schemas/story-share.ts`; Server Action inserts `stories` under RLS; no Tailwind.
  - Done when: Share is blocked without both consents; submitted story is the member’s own row only.

- [ ] **E4-T08** Lock GEMA until `lifestyle_base_complete()` is true. `#task #epic/member`
  - Route: overlay `gema`
  - HCI: Locked empty state with ≥ 44×44 “Continue BASE”; never grey-out by opacity alone.
  - Stack: RPC `lifestyle_base_complete()` (security invoker); UI lock is secondary to server lock.
  - Done when: A crafted client request cannot read GEMA-only data before BASE is done.

- [ ] **E4-T09** GG-VERSE remains invitation copy — sponsor sends the link. `#task #epic/member`
  - Route: overlay `ggverse`
  - HCI: Ceremonial card is not a fake disabled control; CTA ≥ 44×44; gold focus.
  - Stack: No Academy admin routes here; outbound link only; no service role.
  - Done when: Copy does not imply the member can self-provision GG-VERSE.

- [ ] **E4-T10** Settings: notifications + capsules/day (2–3), QR full-size. `#task #epic/member`
  - Route: overlay `settings` · `qr`
  - HCI: Switch and steppers ≥ 44×44; `aria-checked` on the switch; stepper has `aria-label`; gold focus.
  - Stack: Persist to `profiles` via Server Action; Zod range 2–3; QR from `card_no`.
  - Done when: Capsule count cannot go below protocol minimum; QR dialog is labelled.

- [ ] **E4-T11** Order sheet stays **mock** — no payment processing in the browser. `#task #epic/member`
  - Route: overlay `order` · bottom bar
  - HCI: Quantity stepper ≥ 44×44; submit ≥ 44×44; `aria-live` for “Order queued”; gold focus.
  - Stack: No Maya/keys in client; no `NEXT_PUBLIC_` payment secrets; Server Action may record intent later.
  - Done when: Place-order cannot charge a card; copy says mock until an approved processor lands.
