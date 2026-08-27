# Gutguard Lifestyle

Member lifestyle app: Ginhawa funnel → door card → My Health / My Team / My Story.

After register, the first session is the door card — not the full member OS. See [docs/first-session.md](./docs/first-session.md).

**Stack:** Next.js App Router + TypeScript + Design System portable CSS + Supabase + Vercel-ready npm.

**UI:** Gutguard Design System (bone, ultramarine, Fraunces, Inter Tight). No Tailwind.

## Auth

**Email OTP** when Supabase env is set. Register collects name, mobile, and email. The one-time code goes to email. Mobile is stored on the member profile (SMS OTP later, when a provider is configured).

**Mock fallback** when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty: the same register form writes a `localStorage` session and skips the code step. Use this for UI work.

Planned shared identity with GEMA and Academy: [docs/unified-profile.md](./docs/unified-profile.md).

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
