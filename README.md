# Gutguard Lifestyle

Member lifestyle app: Ginhawa funnel → door card → My Health / My Team / My Story. Operator tables under `/admin`.

After register, the first session is the door card — not the full member OS. See [docs/first-session.md](./docs/first-session.md).

**Stack:** Next.js App Router + TypeScript + Design System portable CSS + Supabase + Vercel-ready npm.

**UI:** Gutguard Design System (bone, ultramarine, Fraunces, Inter Tight). No Tailwind.

## Auth

**Email and password** when Supabase env is set (cookie session via `@supabase/ssr`). Register collects name, mobile, email, and a password. `localStorage` is **not** authorization in that mode.

**Mock fallback** only when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty: the same register form writes a `localStorage` session. Use this for UI work.

One Account (this app is the hub; GEMA Auth + OneGrinders for all systems): [docs/obsidian/One Account](./docs/obsidian/One%20Account/One%20Account.md). Drop that folder at `C:\Users\najee\Documents\One Account\`.

GEMA and My Team stay locked until all five BASE steps are done (`lifestyle_base_complete()`).

## Admin

`/admin/*` requires a cookie session **and** a row in `app_roles` (`lifestyle_is_admin()`). Assign admins only via SQL / service role — members cannot self-escalate. `lib/supabase/admin.ts` stays server-only.

- Users: search/filter + `/admin/users/[id]` read-only audit
- Orders: pending/reconciled/failed + Maya webhook at `POST /api/webhooks/maya`
- Stories: bulk approve/reject; member feed shows **approved** only

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development, a phase jumper sits at the bottom of the screen.

To persist members for real:

1. Point **local / Preview** at GutGuard Staging (`https://fxdsnacuonfvutdquogb.supabase.co`) — same Auth as GEMA Staging. Do not point Production at Staging.
2. Put the Staging URL and anon/publishable key in `.env.local`. Service role is server-only.
3. Apply migrations under `supabase/migrations/` in order (member → identity → admin RBAC → orders/stories).
4. Optionally: `insert into public.app_roles (user_id, role) values ('…', 'admin');`
5. Add the same names on Vercel **Preview** (not Production). Service role server-only.
6. Add the preview URL to the Staging Auth redirect allow-list.

## Scripts

- `npm run dev` — local server
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm test` — points helper

## Vaults (read-only)

- Tech stack: `d:\GutGuard\GutGuard Tech Stack\`
- Design system: `d:\GutGuard\GutGuard Design System\`
- Board: `d:\GutGuard\Bien To Do\`
