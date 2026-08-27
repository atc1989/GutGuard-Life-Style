# Gutguard Lifestyle

Member lifestyle app: Ginhawa funnel → door card → My Health / My Team / My Story.

After register, the first session is the door card — not the full member OS. See [docs/first-session.md](./docs/first-session.md).

**Stack:** Next.js App Router + TypeScript + Design System portable CSS + Supabase + Vercel-ready npm.

**UI:** Gutguard Design System (bone, ultramarine, Fraunces, Inter Tight). No Tailwind.

## Auth

**Email and password** when Supabase env is set (cookie session via `@supabase/ssr`). Register collects name, mobile, email, and a password. `localStorage` is **not** authorization in that mode.

**Mock fallback** only when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty: the same register form writes a `localStorage` session. Use this for UI work.

One Account (this app is the hub; GEMA Auth + OneGrinders for all systems): [docs/obsidian/One Account](./docs/obsidian/One%20Account/One%20Account.md). Drop that folder at `C:\Users\najee\OneDrive\Documents\GutGuard\One Account\`.

GEMA stays locked until all five BASE steps are done. With Supabase on, `lifestyle_base_complete()` enforces that server-side.

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
3. Add the same names on Vercel **Preview** (not Production).
4. Add the preview URL to the Staging Auth redirect allow-list.

## Scripts

- `npm run dev` — local server
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm test` — points helper

## Vaults (read-only)

- Tech stack: `d:\GutGuard\GutGuard Tech Stack\`
- Design system: `d:\GutGuard\GutGuard Design System\`
