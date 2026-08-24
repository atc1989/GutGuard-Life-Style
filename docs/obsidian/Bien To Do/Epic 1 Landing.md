---
title: Epic 1 Landing
tags:
  - gutguard
  - epic/landing
  - task
---

# Epic 1 — `/` Landing

Guest arrives at Ginhawa. They understand the gift (a card and an invitation, nothing to pay to start) and choose to begin the Lifestyle Protocol.

**Routes:** `/` (gift) · `/welcome` (plain forum)  
**Files:** `app/page.tsx` · `app/welcome/page.tsx` · `components/funnel/LandingView.tsx` · `components/lifestyle/WelcomeOverlay.tsx`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. First-run overlay states the offer.
2. Hero + ceremonial/commerce card explains “card and invitation.”
3. Trust stats and three-step explainer reduce uncertainty.
4. FAQ accordion answers selling / payment fears.
5. Primary CTA takes them to `/register`.

### Tasks

- [ ] **E1-T01** Ship first-run welcome overlay so a new guest hears the offer before the page competes for attention. `#task #epic/landing`
  - Route: `/` · `/welcome`
  - HCI: Overlay is `role="dialog"` `aria-modal="true"` with labelled title; dismiss/continue control ≥ 44×44; `:focus-visible` outline `var(--gold)`; `prefers-reduced-motion` on entrance.
  - Stack: App Router client island only for overlay state; portable CSS ceremonial tokens; persist `welcome_seen` through a Server Action + Supabase profile when a cookie session exists — not as auth.
  - Done when: Keyboard users can complete or dismiss without a mouse; reduced-motion users get no full-screen animation trap.

- [ ] **E1-T02** Render the gift landing (`/`) in editorial dialect with a commerce pill CTA. `#task #epic/landing`
  - Route: `/`
  - HCI: Primary CTA ≥ 44×44; gold focus ring; link wrapping a button still exposes a single tab stop; no opacity-only hover.
  - Stack: Server Component page in `app/page.tsx`; portable CSS (`--bone`, `--blue`, `--ink`, `--gold`); Fraunces display + Inter Tight UI; no Tailwind.
  - Done when: “Ready now? Start my Lifestyle Protocol” goes to `/register` and survives 320px width without clipping.

- [ ] **E1-T03** Render the plain Ginhawa forum landing (`/welcome`) without mixing ceremonial radii into the commerce card. `#task #epic/landing`
  - Route: `/welcome`
  - HCI: Same 44×44 CTA and gold focus as gift landing; eyebrow micro-labels remain uppercase and readable.
  - Stack: App Router `app/welcome/page.tsx`; one dialect per screen; copy uses **Gutguard**.
  - Done when: Gift vs plain variants share the CTA path but not radius policy.

- [ ] **E1-T04** Show trust stats (members, centers, research, USAID) as scanable facts, not decoration. `#task #epic/landing`
  - Route: `/` · `/welcome`
  - HCI: Stat cards are not fake buttons; if tappable later, ≥ 44×44 and `aria-label`.
  - Stack: Static content from a typed module; no ORM; portable CSS stat card.
  - Done when: Stats remain legible in the ~440px mobile column.

- [ ] **E1-T05** Explain the three funnel steps: get card → invite a friend → points pay for first Gutguard. `#task #epic/landing`
  - Route: `/` · `/welcome`
  - HCI: Step cards are readable without hover; if a step becomes a link, gold focus + 44×44 hit area.
  - Stack: App Router; typed `FUNNEL_STEPS`; no Tailwind grid utilities.
  - Done when: A first-time guest can restate the offer without opening FAQ.

- [ ] **E1-T06** Provide short answers (FAQ accordion) for “do I pay / do I have to sell?” `#task #epic/landing`
  - Route: `/` · `/welcome`
  - HCI: Accordion heads ≥ 44×44; `aria-expanded` reflects open state; `:focus-visible` `var(--gold)`; chevron is decorative (`aria-hidden`).
  - Stack: Client accordion only; content is static TypeScript; lucide outline icon.
  - Done when: Keyboard users can open/close every item; selling is explicitly optional.

- [ ] **E1-T07** Offer next-place links (Telegram, Facebook, full site) without trapping focus. `#task #epic/landing`
  - Route: `/` · `/welcome`
  - HCI: Text links have gold focus-visible and adequate line-height; `rel="noreferrer"` on external targets.
  - Stack: Plain anchors; no third-party widgets; no secrets in the browser.
  - Done when: External links open safely and remain usable at 44px row height.
