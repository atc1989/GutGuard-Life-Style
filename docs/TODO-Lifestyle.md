# Gutguard Lifestyle — phased to-do

Adapted from `d:\GutGuard\To do Mancera.md` for **this** product repo ([GutGuard-Life-Style](https://github.com/atc1989/GutGuard-Life-Style)).

Obsidian journey board (HCI + stack on every task): [Part 1 — End-User Journey & Task Model](./obsidian/01%20-%20Part%201%20End-User%20Journey%20%26%20Task%20Model.md).

**Do not edit** `GutGuard Design System/` or `GutGuard Tech Stack/`. Implement only here.

Academy `/admin`, `/staff`, `/trainer` work stays in **gentrep-academy** — not this app.

---

## Always read the Obsidian vaults first

**Every session. Before any architecture, data, auth, deploy, dependency, or frontend change.**

Read only. Never create, edit, or delete files inside those two vaults.

### GutGuard Tech Stack (minimum)

1. `00 - OWNER — Read only`
2. `00 - GutGuard Tech Stack`
3. `01 - Canonical Stack`
4. `02 - Supabase Conventions`
5. `03 - Frontend Conventions`
6. `04 - Deploy and Env`
7. `07 - Using the Tech Stack with Cursor`
8. `Templates/AGENTS-tech-stack` (already pasted into `AGENTS.md`)
9. `05 - Playbook` when the work is a repeatable flow

Local path: `d:\GutGuard\GutGuard Tech Stack\`

### GutGuard Design System (before any UI)

1. `00 - OWNER — Read only`
2. `00 - GutGuard Design System`
3. `01 - Visual Foundations`
4. `03 - Portable CSS Starter`
5. `07 - Using the DS with Cursor`
6. `Foundations/Dialects` · `Components/Index` · `Systems/GutGuard-Lifestyle`
7. `05 - Playbook` QA checklist before merge
8. `Showcase/index.html` when unsure how a control should look

Local path: `d:\GutGuard\GutGuard Design System\`

### Stack defaults (do not violate)

- Next.js App Router + TypeScript
- Supabase, no ORM
- Vercel + npm + ESLint
- Zod + React Hook Form
- Design System portable CSS
- **No Tailwind. No shadcn.**
- Service role keys: server / Vercel only — never `NEXT_PUBLIC_`
- Prototype HTML = structure only; skin with Doctors tokens
- Recognition: bone `#F4F1EA`, blue `#0608A9`, ink `#0F0F18`, gold `#B08D5B`, Fraunces + Inter Tight, paper grain, uppercase micro-labels
- House spelling in UI: **Gutguard**

### Dialects (one per screen)

| Screen | Dialect |
|---|---|
| Landing / welcome | Editorial marketing + commerce CTAs |
| Register | Editorial booth |
| Door card | Editorial ceremonial |
| Nearly free + member app + sheets | Commerce |

---

## Work on the board: Gutguard Lifestyle (member app)

Product surface (not Academy admin):

1. **Ginhawa funnel** — `/` · `/welcome` · `/register` · `/card` · `/nearly`
2. **Member app** — `/app/health` · `/app/team` · `/app/story`
3. **Sheets** — Order · Settings · BASE · GEMA · GG-VERSE · Story share · QR

Auth (current): **email OTP** when Supabase env is set; **localStorage mock** when it is not. Mobile is stored on the profile. SMS OTP is later.

---

## Phased to-do (Lifestyle)

Check a box only after the vault reads for that kind of work are done.

### Phase 0 — Vault gate (every session)

- [x] Tech Stack + Design System gates in `AGENTS.md`
- [x] No Tailwind / no shadcn in `package.json`
- [x] No public service-role key (`SUPABASE_SERVICE_ROLE_KEY` server-only in `.env.example`)
- [x] Re-read OWNER + Canonical + Supabase + Frontend + Deploy before the next stack change
- [x] Re-read Visual Foundations + Portable CSS + Dialects before the next UI pass

### Phase 1 — Greenfield scaffold (landed)

- [x] Next.js App Router + TypeScript + npm
- [x] Supabase clients split: `lib/supabase/client.ts` · `server.ts` · `admin.ts`
- [x] `.env.example` with canonical names
- [x] Portable CSS + Fraunces / Inter Tight
- [x] Funnel + member routes + shell (≥900px sidebar / mobile bottom bar)
- [x] Forms: Zod + RHF on register (+ story share)
- [x] `npm run lint` / `npm run build` pass
- [x] GitHub: [atc1989/GutGuard-Life-Style](https://github.com/atc1989/GutGuard-Life-Style)

### Phase 2 — UI depth (prototype structure still thin)

From `Systems/GutGuard-Lifestyle.md` product-specific list + harvest gaps:

- [x] Welcome full-screen overlay
- [x] Invite / contact picker sheet (search, share menu, points pending)
- [x] Stories of Hope share wizard (relationship, outcomes, before/after, consent) beyond the basic form
- [x] Multi-day dose calendar + proof review (not only “today”)
- [x] Points ledger UX (Telegram / Facebook earn CTAs, pending → real)
- [x] Spinner + button loading states
- [x] Mobile drawer grab / bottom-sheet polish; toast sits above bottom bar
- [ ] Visual QA vs Design System Playbook checklist + Showcase

### Phase 3 — Auth + member data

- [x] Choose auth pattern and document in README (`email OTP` + mobile on profile; mock fallback)
- [ ] Create Supabase **dev** project (owner — needs dashboard login)
- [x] Migrations under `supabase/migrations/` (profiles, invites, dose_logs, BASE, points, stories, proofs)
- [x] RLS on every user-facing table (default deny)
- [x] Middleware cookie session refresh (`@supabase/ssr`)
- [x] Register verifies email OTP when env is set; mock session still used when env is empty
- [x] Seed data for **development only** (optional, commented `supabase/seed.sql`)

### Phase 4 — Member features on real data

- [x] Persist door card / claimed / nearly-free progress
- [x] Invite create + pending points under RLS (stage updates when they show / buy)
- [x] Dose log + camera proof to Storage (bucket + policies)
- [x] BASE Activation steps + GEMA lock gate server-side (`lifestyle_base_complete()`)
- [x] Order sheet: keep mock until Maya (or approved) payments land
- [x] Settings: notifications + capsules/day persisted to profile

### Phase 5 — Design System skin (ongoing)

- [x] One dialect per screen (no mixed radii)
- [x] Remap any leftover prototype cool-paper / royal / amber
- [x] 44px targets, gold focus-visible on buttons, blue field halo
- [x] `prefers-reduced-motion` honored on flip / confetti / drawers / welcome / spinner
- [x] Empty states use `gg-empty` patterns

### Phase 6 — Security, env, deploy

- [x] Re-read Supabase conventions + Deploy and Env
- [x] `vercel.json` + `.env.example` ready for a Vercel Next.js project
- [ ] Vercel project linked to this repo (owner)
- [ ] Env: `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `NEXT_PUBLIC_SITE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in Vercel **server only**
- [ ] Auth redirect URLs include production + preview hosts
- [ ] Preview deploys on PR
- [ ] RLS verified with a non-admin user

### Phase 7 — Done when

- [ ] Member can complete funnel → enter app without mock session (needs live Supabase project)
- [x] My Health / Team / Story write through server actions when env is set
- [x] GEMA stays locked until BASE complete (client + `lifestyle_base_complete()`)
- [x] No Tailwind / no service role on client
- [ ] Deployed on Vercel (owner)
- [x] This note still matches the running app

---

## Explicitly out of scope here

| Item | Where it belongs |
|---|---|
| Admin portal `/admin`, RBAC, CMS, tickets | gentrep-academy |
| Staff check-in `/staff` | gentrep-academy |
| Trainer queue `/trainer` | gentrep-academy |
| Real GEMA training UI | Academy |
| Maya checkout / webhooks | Later Lifestyle pass (optional) |

---

## Suggested next session

1. Create the Supabase **dev** project and apply `supabase/migrations/20260822000000_lifestyle_member.sql`
2. Fill `.env.local` and Vercel env (anon public, service role server-only)
3. Visual QA against Design System Showcase + Playbook
4. Do not start Academy admin work in this repo
