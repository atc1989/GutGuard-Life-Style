# Gutguard Lifestyle

Member lifestyle app: Ginhawa funnel → door card → My Health / My Team / My Story.

**Stack:** Next.js App Router + TypeScript + Design System portable CSS + Supabase clients (auth not wired yet) + Vercel-ready npm.

**Auth (this pass):** mock session in `localStorage`. Register with name + mobile only. Real Supabase Auth comes later.

**UI:** Gutguard Design System (bone, ultramarine, Fraunces, Inter Tight). No Tailwind.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development, a phase jumper sits at the bottom of the screen.

## Scripts

- `npm run dev` — local server
- `npm run lint` — ESLint
- `npm run build` — production build

## Two-week plan

Week 1 (HTML → Next.js conversion) is in this repo. Week 2 (mobile, polish, first Supabase write-through) is in [BIEN-TWO-WEEK-PLAN.md](BIEN-TWO-WEEK-PLAN.md).

## Vaults (read-only)

- Tech stack: `d:\GutGuard\GutGuard Tech Stack\`
- Design system: `d:\GutGuard\GutGuard Design System\`
