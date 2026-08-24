# Gutguard Lifestyle — phased to-do

Adapted from `d:\GutGuard\To do Mancera.md` for **this** product repo ([GutGuard-Life-Style](https://github.com/atc1989/GutGuard-Life-Style)).

Obsidian journey board (HCI + stack on every task): [Bien To Do](./obsidian/Bien%20To%20Do/Bien%20To%20Do.md).

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
| Admin `/admin/*` | Admin (square, dense) |

---

## Work on the board: Gutguard Lifestyle (member app)

Product surface:

1. **Ginhawa funnel** — `/` · `/welcome` · `/register` · `/card` · `/nearly`
2. **Member app** — `/app/health` · `/app/team` · `/app/story`
3. **Sheets** — Order · Settings · BASE · GEMA · GG-VERSE · Story share · QR
4. **Operator desk** — `/admin/users` · `/admin/orders` · `/admin/stories`

Auth (current): **name + mobile + password** cookie session via `supabase.auth.signUp()` when env is set; **dev cookie + localStorage UI fallback** when it is not. Mobile is stored on the profile. SMS OTP is later.

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
- [x] Migrations under `supabase/migrations/` (profiles, invites, dose_logs, BASE, points, stories, proofs, admin RBAC)
- [x] RLS on every user-facing table (default deny)
- [x] Middleware cookie session refresh (`@supabase/ssr`)
- [x] `/admin/*` refused unless `lifestyle_is_admin()` is true
- [x] Register creates a cookie session via `signUp` when env is set; mock cookie + localStorage UI fallback when env is empty
- [x] Seed data for **development only** (optional, commented `supabase/seed.sql`)

### Phase 4 — Member features on real data

- [x] Persist door card / claimed / nearly-free progress
- [x] Invite create + pending points under RLS (stage updates when they show / buy)
- [x] Dose log + camera proof to Storage (bucket + policies)
- [x] BASE Activation steps + GEMA lock gate server-side (`lifestyle_base_complete()`)
- [x] Order sheet: queue a pending order on the server; Maya/bank webhook reconciles. No browser payments.
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
- [x] `SUPABASE_SERVICE_ROLE_KEY` documented as Vercel **server only**; used by `/admin/users` via `lib/supabase/admin.ts`
- [ ] Auth redirect URLs include production + preview hosts
- [ ] Preview deploys on PR
- [ ] RLS verified with a non-admin user

### Phase 7 — Done when

- [ ] Member can complete funnel → enter app without mock session (needs live Supabase project)
- [x] My Health / Team / Story write through server actions when env is set
- [x] GEMA stays locked until BASE complete (client + `lifestyle_base_complete()`)
- [x] No Tailwind / no service role on client
- [x] `/admin/users` lists members through the server-only admin client when env is set
- [x] `/admin/orders` tracks pending / reconciled / failed via server webhooks
- [x] `/admin/stories` approves or flags before `/app/story`
- [ ] Deployed on Vercel (owner)
- [x] This note still matches the running app

---

## Explicitly out of scope here

| Item | Where it belongs |
|---|---|
| Lifestyle operator desk `/admin/users` · `/admin/orders` · `/admin/stories` | **this repo** — Epics 5–8 |
| Academy CMS, tickets, staff check-in `/staff`, trainer `/trainer` | gentrep-academy |
| Real GEMA training UI | Academy |
| Live Maya Checkout session (hosted pay page) | Later — webhook + queue are in this pass |

---

## Suggested next session

1. Create the Supabase **dev** project and apply migrations in `supabase/migrations/`
2. Fill `.env.local` and Vercel env (anon public, service role server-only)
3. Grant the first admin in the SQL editor (`update public.profiles set role = 'admin' where …`)
4. Visual QA against Design System Showcase + Playbook
