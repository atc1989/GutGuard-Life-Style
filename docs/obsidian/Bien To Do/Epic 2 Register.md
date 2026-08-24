---
title: Epic 2 Register
tags:
  - gutguard
  - epic/register
  - task
---

# Epic 2 — `/register` Auth & Zod

The guest becomes a member. Identity is collected, validated, and stored as a **cookie session**. They leave with a session, not a `localStorage` mock as the source of truth.

**Route:** `/register`  
**Files:** `app/register/page.tsx` · `components/funnel/RegisterForm.tsx` · `lib/schemas/auth.ts` · `lib/actions/auth.ts` · `lib/supabase/server.ts`

Locks: [[00 - Locks]] · Board: [[Bien To Do]]

### Journey

1. Editorial booth: name, mobile, credential.
2. Client Zod via react-hook-form; server Zod in the Server Action (never trust the client).
3. `createClient()` from `lib/supabase/server.ts` writes Auth cookies.
4. Errors are announced, not toasted-only.
5. Success **server-redirects** to `/card`.

### Tasks

- [x] **E2-T01** Keep `/register` as an editorial booth — one dialect, ruled fields, no commerce radius mix. `#task #epic/register`
  - Route: `/register`
  - HCI: Labels bound with `htmlFor`; controls ≥ 44×44; gold focus on inputs and submit; uppercase eyebrows.
  - Stack: App Router; portable CSS editorial tokens; no Tailwind/shadcn.
  - Done when: The booth reads as a ceremonial form, not a dashboard.

- [x] **E2-T02** Author `lib/schemas/auth.ts` with Zod for **name**, **mobile**, and **password** (explicit strength). `#task #epic/register`
  - Route: `/register` (schema)
  - HCI: Strength rules are human-readable in `aria-describedby` hint text, not only in thrown errors.
  - Stack: Strict TypeScript Zod schema in `lib/schemas/`; PH mobile `09…` / `+639…`; password ≥ 8 with upper, lower, and a digit.
  - Done when: Weak passwords fail with field-level messages; valid PH numbers normalize for Auth.

- [x] **E2-T03** Bind the form with react-hook-form + `@hookform/resolvers/zod` against that schema. `#task #epic/register`
  - Route: `/register`
  - HCI: `aria-invalid` and `aria-describedby` on every invalid field; form-level `aria-live="polite"` for action errors; `noValidate` so RHF owns UX.
  - Stack: Client form; Zod resolver; no inline styles for error color — use `--error` / portable error class.
  - Done when: Submitting empty fields never hits the network; screen readers hear the first error.

- [x] **E2-T04** Create Server Action `lib/actions/auth.ts` that re-validates with Zod and calls `supabase.auth.signUp()` on the cookie server client. `#task #epic/register`
  - Route: Server Action (POST from `/register`)
  - HCI: Map Auth failures to calm, non-technical copy; never dump raw stack traces into the booth.
  - Stack: `"use server"`; `createClient()` from `lib/supabase/server.ts` (`@supabase/ssr`); email/password (or equivalent metadata) + `options.data` for name/mobile; **no admin/service-role** in this action; no ORM.
  - Done when: A valid payload creates an Auth user and Set-Cookie headers; duplicate identity returns a field/form error.

- [x] **E2-T05** Keep the submit control size-stable while the action runs. `#task #epic/register`
  - Route: `/register`
  - HCI: Button remains ≥ 44×44; **do not swap the label** for a longer loading string; `aria-busy="true"`; disabled uses bone-soft fill + ink-4 text (not opacity); gold focus still visible if focus remains.
  - Stack: `useActionState` / transition; lucide outline spinner in a **fixed 20×20 slot**; portable CSS only.
  - Done when: Layout does not jump on pending; assistive tech hears that the card is being created.

- [x] **E2-T06** On successful sign-up, set the Supabase cookie session and **server-redirect** to `/card`. `#task #epic/register`
  - Route: `/register` → `/card`
  - HCI: No flash of the booth after success; if redirect fails, `aria-live` error stays on the form.
  - Stack: `redirect("/card")` from the Server Action (not `router.push` as the source of truth); cookie `getAll`/`setAll`; `proxy.ts` can refresh later.
  - Done when: `/card` can read `user_metadata.name` from `getUser()`; `gg-lifestyle-session` is not required for the name on the door.

- [x] **E2-T07** Treat `localStorage` mock as a **dev fallback only**, never as authorization. `#task #epic/register`
  - Route: `/register` · `/app/*`
  - HCI: Mock and live paths present the same booth errors and targets.
  - Stack: Cookie session via `@supabase/ssr`; RLS still default-deny; service role never in the browser.
  - Done when: Empty env is documented; a real session is what `/app` proxy checks.
