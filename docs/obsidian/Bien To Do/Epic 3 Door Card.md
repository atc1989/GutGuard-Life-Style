---
title: Epic 3 Door Card
tags:
  - gutguard
  - epic/card
  - task
---

# Epic 3 — `/card` Door Interaction

The new member receives a ceremonial card they can show at the door. Staff scan the back. Claiming turns the guest card into a Lifestyle Member card.

**Routes:** `/card` · `/card?claimed=1` · `/nearly` (bridge)  
**Files:** `app/card/page.tsx` · `components/funnel/DoorCard.tsx` · `components/lifestyle/FlipCard.tsx` · `components/funnel/NearlyFree.tsx`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Front: member name on ceremonial paper.
2. Flip: QR + card number for staff (`Ipakita ito sa pintuan`).
3. Continue → claimed; confetti if motion allowed.
4. Nearly-free ledger: points toward the first ₱4,500 order.
5. CTA enters the member hub.

### Tasks

- [ ] **E3-T01** Load the door card from the cookie session (name from Auth metadata / `profiles`). `#task #epic/card`
  - Route: `/card`
  - HCI: Name is in a real heading; loading fallback is a `main`, not a spinner-only void.
  - Stack: App Router Server Component reads `createClient().auth.getUser()`; strict TypeScript; no ORM.
  - Done when: The face shows the registered name after sign-up, not a seed persona.

- [ ] **E3-T02** Make the flip target a real button with an accessible name. `#task #epic/card`
  - Route: `/card`
  - HCI: Entire flip surface is a `<button>` ≥ 44×44 (card is larger); `aria-label="Flip member card"`; `aria-pressed` or text cue for front/back; gold focus-visible; `prefers-reduced-motion` disables 3D flip.
  - Stack: Client island; portable CSS `.gg-flip`; no Tailwind transforms.
  - Done when: Keyboard users can flip; reduced-motion users still reach the QR side.

- [ ] **E3-T03** Show staff QR + monospace card number on the back. `#task #epic/card`
  - Route: `/card`
  - HCI: QR has sufficient contrast on paper; number is selectable text, not only an image.
  - Stack: Typed `card_no` from profile; portable CSS ceremonial back; no third-party QR SaaS secrets in the client.
  - Done when: A staff member can scan or read the number in bright outdoor light.

- [ ] **E3-T04** Claim the card (`Continue`) and persist claimed state. `#task #epic/card`
  - Route: `/card` → `/card?claimed=1`
  - HCI: Continue ≥ 44×44; gold focus; confetti gated by reduced-motion; `aria-live` optional confirmation.
  - Stack: Server Action updates `profiles.claimed` + phase under RLS; App Router navigation.
  - Done when: Refresh keeps claimed; unauthenticated users cannot write another member’s row.

- [ ] **E3-T05** After claim, explain that this is now the Lifestyle Member card. `#task #epic/card`
  - Route: `/card?claimed=1`
  - HCI: Heading change is visible and in the accessibility tree; CTA ≥ 44×44.
  - Stack: Same page, query or profile flag; portable CSS; Gutguard spelling.
  - Done when: Copy matches claimed vs unclaimed without a layout jump that hides the CTA.

- [ ] **E3-T06** Bridge to nearly-free: points are not cash; they only pay for the member’s own first order. `#task #epic/card`
  - Route: `/nearly`
  - HCI: Progress rail has an accessible `label`; invite rows are not tiny hit targets; CTA ≥ 44×44 gold focus.
  - Stack: Commerce dialect; points from `profiles` / `point_events` via Server Components or actions; no ORM.
  - Done when: Guest can enter `/app/health` from this screen; ledger math is explained in plain language.
