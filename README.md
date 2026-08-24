# Gutguard Lifestyle

Member lifestyle app: Ginhawa funnel → door card → My Health / My Team / My Story.

**Stack:** Next.js App Router + TypeScript + Design System portable CSS + Supabase + Vercel-ready npm.

**UI:** Gutguard Design System (bone, ultramarine, Fraunces, Inter Tight). No Tailwind.

## Auth

**Cookie session** when Supabase env is set. Register collects **name**, **mobile**, and a **password**. The Server Action re-validates with Zod, calls `supabase.auth.signUp()` on the cookie client in `lib/supabase/server.ts`, and **redirects to `/card`**. Identity for Auth is a derived email from the PH mobile (`639…@members.gutguard.ph`) plus `user_metadata` for name and number. Turn **off** “Confirm email” in the Supabase Auth settings so sign-up can issue a session immediately.

**Mock fallback** when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty: the same booth still validates, then the action sets a `gg-dev-member` cookie and redirects to `/card`. `localStorage` (`gg-lifestyle-session`) is a **dev UI fallback only** — it is not authorization. `/app` is refused without a Supabase cookie when env is set.

SMS OTP is later, when a provider is configured.

GEMA stays locked until all five BASE steps are done. With Supabase on, `lifestyle_base_complete()` enforces that server-side.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development, a phase jumper sits at the bottom of the screen.

To persist members for real:

1. Create a Supabase **dev** project.
2. Put the URL and anon key in `.env.local`.
3. Apply `supabase/migrations/20260822000000_lifestyle_member.sql`.
4. Add the same env vars on Vercel (service role: server only).
5. Add the production and preview URLs to Supabase Auth redirect allow-list.

## Scripts

- `npm run dev` — local server
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm test` — points helper

## Vaults (read-only)

- Tech stack: `d:\GutGuard\GutGuard Tech Stack\`
- Design system: `d:\GutGuard\GutGuard Design System\`
