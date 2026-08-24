# Gutguard Lifestyle

Member lifestyle app: Ginhawa funnel → door card → My Health / My Team / My Story.

**Stack:** Next.js App Router + TypeScript + Design System portable CSS + Supabase + Vercel-ready npm.

**UI:** Gutguard Design System (bone, ultramarine, Fraunces, Inter Tight). No Tailwind.

## Auth

**Cookie session** when Supabase env is set. Register collects **name**, **mobile**, and a **password**. The Server Action re-validates with Zod, calls `supabase.auth.signUp()` on the cookie client in `lib/supabase/server.ts`, and **redirects to `/card`**. Identity for Auth is a derived email from the PH mobile (`639…@members.gutguard.ph`) plus `user_metadata` for name and number. Turn **off** “Confirm email” in the Supabase Auth settings so sign-up can issue a session immediately.

**Mock fallback** when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty: the same booth still validates, then the action sets a `gg-dev-member` cookie and redirects to `/card`. `localStorage` (`gg-lifestyle-session`) is a **dev UI fallback only** — it is not authorization. `/app` is refused without a Supabase cookie when env is set.

SMS OTP is later, when a provider is configured.

GEMA stays locked until all five BASE steps are done. With Supabase on, `lifestyle_base_complete()` enforces that server-side.

## Admin

`/admin/*` is an operator desk in the **admin dialect** (square radii, dense table).

When Supabase env is set, `proxy.ts` and `app/admin/layout.tsx` require a cookie session **and** `lifestyle_is_admin()`. Unauthorized people land on `/denied` with labelled copy (signed-out vs operator-only) — never a crash.

The member directory at `/admin/users` lists every profile through `lib/supabase/admin.ts` (`SUPABASE_SERVICE_ROLE_KEY`, `"use server"` only). Own-row RLS would hide other members, so the service-role client is required for the table. Members cannot change `profiles.role`; a trigger blocks self-promotion.

Grant the first admin in the SQL editor (no JWT) after they register:

```sql
update public.profiles
set role = 'admin'
where mobile = '+639175550100';
```

Empty env shows a labelled **preview** table so the desk can be verified locally. That preview is not authorization.

## Orders & webhooks

Members **queue** bottles from the order sheet. The Server Action writes `orders` as `pending` and computes the peso amount on the server. Nothing is charged in the browser.

Maya Checkout or a bank POSTs to `POST /api/payments/webhook`. The handler:

- verifies HMAC when `PAYMENTS_WEBHOOK_SECRET` is set (bank / signed callbacks)
- allowlists IPs when `PAYMENTS_WEBHOOK_IPS` is set (Maya’s documented hosts)
- parses the JSON with Zod
- is idempotent on `(provider, event id)`
- reconciles **Pending / Reconciled / Failed** on `/admin/orders`

Maya does not currently sign Checkout webhooks; IP allowlisting plus payload checks is their guidance. Never put Maya or bank secrets on `NEXT_PUBLIC_`.

## Stories

Shared stories start as `pending`. `/app/story` only lists **approved** community rows (authors still see their own). Operators bulk-approve or flag on `/admin/stories`.

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
3. Apply `supabase/migrations/` in timestamp order (member schema, invites, admin RBAC, then orders/stories).
4. Add the same env vars on Vercel (service role: **server only**, never `NEXT_PUBLIC_`).
5. Add the production and preview URLs to Supabase Auth redirect allow-list.
6. Grant the first `profiles.role = 'admin'` in the SQL editor.

## Scripts

- `npm run dev` — local server
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm test` — points helper

## Vaults (read-only)

- Tech stack: `d:\GutGuard\GutGuard Tech Stack\`
- Design system: `d:\GutGuard\GutGuard Design System\`
