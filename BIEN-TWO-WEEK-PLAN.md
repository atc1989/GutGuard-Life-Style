# Gutguard Lifestyle — Bien’s 2-week transition plan

Owner: **Bien**
Source prototype: `GutguardLifestyle.html` (single-file React booth demo)
Target: enterprise-shaped Next.js App Router app (this repo)
Auth for this pass: UI-first mock session. Real login comes later.

This is a working plan, not a status report. **Week 1 already happened** — the HTML booth is now a Next.js app in this repo. Week 1 below is a **hypothetical but realistic reconstruction** of that work, so Week 2 can be scoped against what is actually shipped.

---

## 1. What this system is

Gutguard Lifestyle is the member product around **Ginhawa**: a free guest path that turns into a **Lifestyle Member card**, then a **daily protocol app**.

It is not a shop-first storefront. It is a **door + habit + invite** loop:

1. Guest gives a name and Philippine mobile.
2. They get a card to show at the door.
3. After the door, points from friends start paying for the first ₱4,500 order.
4. Inside the member app they log doses, refill, finish BASE, and only then unlock team-building.

House spelling in UI: **Gutguard** (capital G only).

Dialect map (do not mix radius policies on one screen):

| Surface | Dialect |
|---|---|
| Landing / welcome | Editorial marketing + commerce CTAs |
| Register | Editorial booth |
| Door card | Editorial ceremonial |
| Nearly free + member app + sheets | Commerce |

---

## 2. What the product does (full system map)

### 2.1 Public funnel (pre-member)

| Phase | Route in this repo | What the guest sees / does |
|---|---|---|
| Ginhawa · Gift | `/` | Welcome-gift landing. Name + number is enough. Trust stats, 3-step “no payment to start”, FAQ. |
| Ginhawa · Plain | `/welcome` | Mental-wellness forum landing (“Ginhawa ng Isip at Damdamin”). Same CTA into register. |
| Sign up | `/register` | Name + PH mobile. No password. Mock session written to `localStorage`. |
| Before the door | `/card` | Flip card: name on the front, QR + card number on the back. Staff scan at the event. |
| After the door | `/card?claimed=1` | Card is claimed. Confetti. Copy flips to “Sa iyo na ’yan.” |
| Nearly free | `/nearly` | Points vs ₱4,500 first order. Invite list by stage. Then “Start my Lifestyle Protocol”. |
| Member | `/app/health` | Enters the member shell. |

**Invite / points model (already in `lib/mock/seed.ts`):**

| Action | Points | Note |
|---|---|---|
| Friend registers | +5 | Pending until they show up |
| Friend’s first attend | +20 | Becomes real |
| Repeat attend | +10 | |
| Join Telegram | +10 | |
| Follow Facebook | +5 | |
| Peso value | ₱10 / point | Plus banked pesos |
| First order | ₱4,500 | Points are not cash. They only pay for the member’s own first order. |

Invite stages: `registered` → `showed` → `bought`.

### 2.2 Member app

Chrome:

- Desktop: sticky sidebar (My Health / My Team / My Story + BASE / GEMA / GG-VERSE / Settings + Order now).
- Mobile (Week 1): content capped ~440px, Health/Team/Story via a segmented control, fixed **Order now** bar. BASE / GEMA / GG-VERSE / Settings are **not reachable** from the mobile chrome.

**My Health** (`/app/health`)

- Daily dose log: Morning Habit, Midday Boost, Sweet Dreams.
- Photo proof (camera / gallery) stored as a filename on the mock session.
- Days of supply left + refill alerts (EN + TL) at 10 / 5 / 0 days.
- Order more (mock checkout, quantity 1–6).
- BASE Activation progress (5 stars).

**My Team** (`/app/team`)

- Locked until all five BASE steps are done.
- Unlocked: contact roster, send invite, pending points.

**My Story** (`/app/story`)

- Community quotes.
- “Share my story” → Stories of Hope sheet (outcomes, consents). Toast only; does not append to the wall yet.

### 2.3 Overlays (commerce sheets)

| Overlay | Purpose |
|---|---|
| Order | Mock protocol reorder. No payment. |
| Settings | Phone alerts, capsules/day (2–3), identity, full-size QR. |
| BASE Activation | 5 events / 21 days. Toggle stars. Upcoming events with “Reserve my seat”. |
| GEMA | Locked until BASE. Then rank cards (Squad / Platoon / Company). |
| GG-VERSE | Invitation-only builder world. Sponsor link. Telegram / Facebook point copy. |
| QR | Full-size door/center scan. |
| Share | Stories of Hope form. |

BASE steps:

1. Welcome Orientation (Day 0–1)
2. Product Belief Session (Day 2–5)
3. Business Exposure (Day 6–10)
4. First Sale (Day 11–17)
5. Duplication Initiation (Day 18–21)

GEMA is the Gentrep Academy. GG-VERSE is the wider builder world, sponsor-gated. Most members only take the protocol. Selling is optional and later.

### 2.4 Session data (what “state” means today)

`lib/session.tsx` persists a `MockSession` in `localStorage` (`gg-lifestyle-session`):

name, mobile, sponsor, team, card number, funnel phase, claimed flag, points / pending / banked, days left, capsules per day, dose log, invites, BASE stars, Telegram flag, notifications, contact-invited map.

Dev-only phase jumper (`DemoStrip`) jumps all seven phases. Production must not ship it.

### 2.5 What is explicitly not live yet

- No Supabase Auth.
- No Postgres tables / RLS (folder exists, README only).
- No real payments.
- No real QR (decorative SVG from card number).
- No push notifications (toggle + inbox UI only).
- No tests.
- Clients in `lib/supabase/` are scaffolded and unused.

---

## 3. What Week 1 actually delivered (this repo)

The HTML booth was a ~600KB single-file React bundle. This repo is the App Router conversion of that booth, not a new product.

**Shipped**

- Next.js 16 + React 19 + TypeScript, npm, ESLint, Vercel-ready.
- Design System portable CSS in `app/globals.css` (bone / ultramarine / gold / Fraunces / Inter Tight / paper grain). **No Tailwind, no shadcn.**
- Routes for every funnel phase + three member pages.
- DS-shaped UI kit: Button, Card, FormField, Accordion, Switch, Drawer/Dialog, Toast, Badge, QR, QuantityStepper, ProgressRail, FileAttachment, EmptyState, SegmentedControl, RequirementTimeline.
- Funnel: landing variants, register (Zod + React Hook Form, PH mobile), flip door card, confetti claim, nearly-free points.
- Member shell: sidebar, masthead, notification bell, overlays, dose log, BASE/GEMA/GG-VERSE, story share form.
- Mock session + overlay + toast providers.
- Supabase browser / server / admin clients + `.env.example`. Service role stays server-only.

**Still booth-quality (the Week 2 backlog)**

- Desktop-first member chrome. Mobile is a narrowed column, not a phone product.
- BASE / GEMA / GG-VERSE / Settings have no mobile entry except the Health “Continue BASE” button.
- Bottom bar is only “Order now”, and it fights the member content padding / demo strip.
- Drawers are a bottom sheet on small screens and a right panel from 900px — focus trap, scroll lock, and iOS keyboard are unfinished.
- Telegram / Facebook earn actions from the HTML are copy + outbound links, not session writes. `facebook` is not even a session field.
- Story share schema has `about` / `relationship`; the form does not collect them. Signed stories do not appear on My Story.
- `settingsSchema` is unused. Settings writes go straight to session.
- URL and `session.phase` can diverge. Member routes are not gated.
- Heavy inline layout styles; 900px is the only layout breakpoint.
- No schema, no RLS, no persistence beyond the browser.

---

## 4. Week 1 — hypothetical reconstruction (done)

Treat this as the record of how the conversion was earned. Do not re-do it. Use it in standups as “already complete”.

### Day 1 — Scaffold the enterprise shell

**Outcome:** an empty Next.js app that already looks like Gutguard, with the stack locked.

- App Router + TypeScript + npm + ESLint. Read Next.js 16 docs in `node_modules/next/dist/docs/` before inventing APIs.
- Portable CSS tokens and type ramp from the Design System. No Tailwind.
- Root layout: Fraunces + Inter Tight, metadata, `gg-surface` grain.
- Folder map: `app/`, `components/{ui,funnel,member,shell,overlays,lifestyle}/`, `lib/{mock,schemas,supabase}/`.
- Scaffold unused Supabase clients + `.env.example`. Service role never `NEXT_PUBLIC_`.
- Seed constants ported from the HTML (points, events, contacts, stories, FAQ, BASE, GEMA).

**Done when:** `npm run dev` boots a bone-coloured shell with correct type.

### Day 2 — Public funnel, screens 1–4

**Outcome:** guest can walk Gift landing → register → door card.

- `/` gift landing and `/welcome` plain landing (shared `LandingView`).
- Trust stats, 3 steps, FAQ accordion, outbound Telegram / Facebook / site links.
- `/register` editorial booth: name + PH mobile, Zod + RHF.
- Mock `SessionProvider` writing `localStorage`.
- `/card` flip card + QR block. Claim CTA writes `claimed` and shows confetti.

**Done when:** demo jumper can hit landing, register, before-door, after-door, and the card flips.

### Day 3 — Nearly free + member chrome

**Outcome:** claimed guests see earnings, then enter a member app frame.

- `/nearly` progress to ₱4,500, invite stage cards, enter protocol CTA.
- Member layout: sidebar, masthead, notification bell, bottom order bar.
- Routes `/app/health`, `/app/team`, `/app/story` + `/app` redirect.
- Overlay store for order / settings / base / gema / ggverse / share / qr.
- Dev `DemoStrip` for all seven phases (dev only).

**Done when:** jumper “Member app” lands in My Health with sidebar on desktop.

### Day 4 — My Health is a real protocol screen

**Outcome:** daily habit loop works on mock data.

- Dose calendar: three slots, progress rail, camera proof (filename only).
- Days-left card + bilingual refill alerts.
- Order drawer with quantity stepper; toast “mock only”.
- BASE card + timeline overlay; event rows with reserve toast.
- Settings drawer: alerts, capsules/day, identity, QR.

**Done when:** logging three doses and attaching a photo survives a refresh (localStorage).

### Day 5 — Team, Story, GEMA, GG-VERSE

**Outcome:** the rest of the HTML member surface exists in React.

- My Team locked empty state until five BASE stars; then contact invite.
- My Story wall + Stories of Hope drawer (outcomes + two consents).
- GEMA locked / unlocked rank cards.
- GG-VERSE ceremonial invite-only panel.
- Full-size QR overlay.
- Notification bell with two stub alerts.

**Done when:** completing BASE in the overlay unlocks My Team and GEMA without a code change.

### Day 6 — Make it a conversion, not a restyle

**Outcome:** HTML behaviour that would be missed in a screenshot pass is in the app.

- Phase jumper wired to real routes.
- Claimed-card search param + session flag.
- Toast viewport above the mobile order bar.
- Reduced-motion on flip / confetti / buttons.
- Copy pass: Gutguard spelling, EN/TL refill lines, door Filipino lines.
- `README`, vault pointers, “auth is mock” called out.

**Done when:** a reviewer can walk the HTML happy path in the Next app without missing a screen.

### Day 7 — Conversion QA and freeze

**Outcome:** Week 1 is frozen so Week 2 can be mobile + depth, not rescue.

- `npm run lint` and `npm run build` clean.
- Desktop pass at ≥900px: sidebar, split funnels, right-edge drawers.
- Punch-list of known gaps (this document, section 3).
- No live schema. No Auth. Explicit.

**Done when:** main contains the conversion and the Week 2 list is agreed.

---

## 5. Week 2 — what Bien does next

Constraint from product: **four days mobile, two days improvements, last day Supabase + freeze.**

Do not start Supabase early. Mobile will change layout and overlay chrome; migrating state before that is wasted work.

### Day 1 (Week 2) — Mobile architecture

**Outcome:** a phone has a complete member chrome. Nothing important lives only in the desktop sidebar.

Work:

- Replace “narrow desktop” with a real small-screen shell:
  - Thumb tab bar: Health / Team / Story.
  - Overflow / More for BASE, GEMA, GG-VERSE, Settings, QR.
  - Order now stays reachable without covering tabs (stack, FAB, or order inside Health — pick one and stick to it).
- Safe areas: `env(safe-area-inset-*)` on tab bar, drawers, funnel, demo offset.
- Viewport: `viewport-fit=cover`, no iOS input zoom (form text ≥16px — already true; verify in sheets).
- Demo strip: compact on 320px; must not steal the tab bar. Still dev-only.
- Scroll lock + focus trap + `aria-modal` on Dialog (Escape exists; body scroll and focus return do not).
- Hide desktop sidebar below 900px (already) but **do not hide its actions**.

Devices to keep open: 320, 375, 390, 430.

**Done when:** on a 390px profile, a member can open Settings, BASE, GEMA, GG-VERSE, and Order without rotating to desktop.

### Day 2 (Week 2) — Funnel on a phone

**Outcome:** Gift → register → door card is usable in one hand at an event.

Work:

- Landing: display type, CTA, 2-up stats, 3-step cards, FAQ. No horizontal scroll. CTA stays in thumb reach.
- Register: editorial booth on a small screen; keyboard does not hide “Get your card”; error text is visible.
- Door card:
  - 420px min-height flip is too tall for many phones — scale the face, keep QR scannable (≥160px, high contrast).
  - Flip is a real control (label, reduced motion fallback: swap faces, no `rotateY`).
  - Claimed confetti does not block the Continue button.
- Nearly free: invite list + ₱ progress stacks cleanly; primary CTA not under the home indicator.

**Done when:** the full guest path is walkable on 375px Safari/Chrome with one thumb, QR readable from 30cm.

### Day 3 (Week 2) — Member screens on a phone

**Outcome:** Health / Team / Story feel like a daily app, not a squeezed desktop page.

Work:

- My Health: dose rows are 44px+ targets; camera sheet works; refill alert wraps; page-head CTA vs tab bar do not double-order.
- My Team: locked empty state CTA is full-width; unlocked roster is list-first (not a cramped 2-col grid).
- My Story: cards read as quotes; “Share my story” opens a sheet that can scroll with the keyboard up.
- Notification panel: currently `position:absolute` under the bell — on mobile it must be a sheet or full-width panel, not clipped.
- Drawers: bottom sheet to 90dvh, footer actions pinned, background not scrollable, swipe/close target large enough.
- Toasts sit above the tab bar (`bottom: 96px` exists; re-measure after the new chrome).

**Done when:** a member can log a dose, attach proof, open Order, and share a story on 390px without dead ends.

### Day 4 (Week 2) — Mobile QA and tablet

**Outcome:** phone work is frozen. Tablet is an explicit layout, not an accident.

Work:

- Breakpoints: phone (<600), large phone / small tablet (600–899), desktop (≥900). 900 stays the sidebar cut.
- Landscape phone: card flip and sheets still usable.
- Touch: no 10px-only hit areas, no hover-only essential UI.
- `prefers-reduced-motion` already stubs animations — verify flip, confetti, drawers.
- PWA-ish hygiene (no store listing): apple-touch / theme colour / manifest optional if cheap; otherwise skip.
- Walk the HTML and this app side by side on a real phone or device mode. File residual issues into Days 5–6, do not slip them into Day 7.

**Done when:** Bien can demo phone + desktop in one sitting; remaining issues are product polish, not “can’t tap Settings”.

### Day 5 (Week 2) — Improvements: HTML fidelity

**Outcome:** behaviour the booth had (or clearly implied) is in the Next app.

Priority, in order:

1. **Telegram / Facebook earn** — session flags + points, disable after claim, same as the HTML. Add `facebook: boolean` to `MockSession`.
2. **Story share complete** — collect about/self vs other + relationship; append a signed story onto My Story (mock list); keep both consents required.
3. **Settings through Zod** — wire `settingsSchema`; capsules/day must recompute refill copy.
4. **Invite richness** — pending vs real copy (“Not yours yet. They have to come to an event first.”). Optional: affiliate vs builder lines on Team.
5. **URL ↔ phase** — visiting `/app/*` without a member phase should bounce to the right funnel step; `/card` respects `session.claimed`.
6. **Notification permission copy** — HTML had “Notifications are blocked — enable them in your browser settings”. Show it if the toggle is on and permission is denied.

Do not invent GEMA courseware or real payments.

**Done when:** the HTML happy path plus Telegram earn + a published story work in Next without the jumper (except for skipping wait-time).

### Day 6 (Week 2) — Improvements: enterprise hygiene

**Outcome:** the codebase looks like a product repo, not a port dump.

Work:

- Accessibility: dialog focus trap, labelled switches, live toasts (`aria-live` exists — verify), card flip name, skip-link if cheap.
- Loading / empty / error: register submit pending, overlay reserved states, story wall empty, team locked (already), failed file type/size on proof.
- Route metadata per page (title: “My Health · Gutguard Lifestyle”, etc.).
- Cut stray inline layout that fights `globals.css`. Keep tokens. Commerce screens keep commerce radius; register stays editorial (no radius mix).
- Session robustness: bad JSON already falls back; add a cheap schema version so Week 2 fields don’t crash old localStorage.
- `npm run lint` + `npm run build`. Add the thinnest possible tests only if they lock a bug (register schema, points math, refill copy). No test theatre.
- README: how to walk the demo on a phone, what is mock, what Day 7 will attach.

**Done when:** a second engineer can clone, `npm install`, walk funnel + member on desktop and phone, and know what is fake.

### Day 7 (Week 2) — Supabase connection + freeze

**Outcome:** the app talks to a Gutguard Supabase project for **persistence**, not a full Auth product. One day cannot be OTP + RLS + payments + storage. Do the first real connection well.

**In scope (must)**

1. Confirm env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role stays server-only and unused in the browser.
2. Migration(s) under `supabase/migrations/` with **RLS on from the first table**:
   - `members` (name, mobile, sponsor, team, card_no, phase, claimed, points, pending, banked, days_left, capsules_per_day, telegram, facebook, notifications)
   - `invites` (member_id, name, stage, timestamps)
   - `dose_logs` (member_id, day, morning, midday, dreams, proof_path nullable)
   - `stories` (member_id, quote fields, consents, created_at)
3. Policies: owner can read/write own rows. Until Auth exists, use a **dev member id** in env or a single demo UUID documented in README — do not open tables to `anon` without a filter.
4. Replace “session is only localStorage” with: hydrate from Supabase on boot, write-through on update, localStorage as offline cache / fallback if env is missing (so `npm run dev` still works without keys).
5. Wire `lib/supabase/client.ts` from the session layer. Do not use the admin client in Client Components.
6. Proof uploads: if Storage is too much for the day, keep filename-only and ticket Storage as follow-up. Prefer a private `dose-proofs` bucket only if it fits without blowing the freeze.
7. Freeze: README env steps, `.env.example` accurate, demo strip still dev-only, lint + build, punch-list of Auth OTP / real QR / payments as **out of scope leftovers**.

**Out of scope for Day 7 (write them down, do not start)**

- Supabase Auth (OTP / magic link) and dropping the name+mobile booth.
- Real payment / PayMongo / GCash.
- Real scannable QR / door hardware.
- Push provider.
- GEMA as a real academy.

**Done when:** with `.env.local` pointed at the project, register → card → dose log → story share survives a browser refresh **and** a second browser profile against the same demo member; without env, the mock session still runs.

---

## 6. Definition of done (end of Week 2)

Bien can hand this to Najee / a reviewer when all of these are true:

- Guest path and member path match the HTML on **phone and desktop**.
- Member actions that lived in the sidebar work on a phone.
- Mock rules still hold: no password, no live payment, DS CSS only.
- Supabase clients are used for member persistence, with RLS, no public unfiltered tables, no service role in the browser.
- `npm run lint` and `npm run build` pass.
- README tells a newcomer how to run it, which keys are needed, and what is still mock.

---

## 7. Suggested standup slice (Week 2)

Keep updates to: **yesterday / today / blocker**. Map to days:

| Day | One-line goal |
|---|---|
| 1 | Phone chrome: tabs + More; Settings/BASE reachable |
| 2 | Funnel + door card one-handed |
| 3 | Health / Team / Story + sheets on 390px |
| 4 | Device QA; freeze mobile |
| 5 | Telegram/Facebook points, story wall, phase gating |
| 6 | A11y, metadata, lint/build, README |
| 7 | RLS migrations + session write-through + freeze |

If a day slips, cut from Day 6 (tests, metadata) before cutting Days 1–4. Do not steal Day 7 for CSS.

---

## 8. File map (where Bien works)

| Area | Paths |
|---|---|
| Funnel | `components/funnel/*`, `app/page.tsx`, `app/welcome`, `app/register`, `app/card`, `app/nearly` |
| Member | `components/member/*`, `app/app/*` |
| Chrome | `components/shell/*` |
| Sheets | `components/overlays/*`, `components/ui/Dialog.tsx`, `Drawer.tsx` |
| State | `lib/session.tsx`, `lib/mock/seed.ts`, `lib/overlay-store.tsx` |
| Validation | `lib/schemas/*` |
| Visual | `app/globals.css` |
| Data | `lib/supabase/*`, `supabase/migrations/` |

Do not edit `GutGuard Tech Stack/` or `GutGuard Design System/` vaults. Read them; implement only in this repo.
