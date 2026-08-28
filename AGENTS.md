<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# One Account — read before every identity / auth / profile move

This repo is the **hub**. GEMA and Academy are spokes. One login: GEMA Auth + OneGrinders.

**Every session, before every task, and after every task:**

1. Read `docs/obsidian/One Account/00 - Session gate.md`
2. Read `docs/obsidian/One Account/One Account.md` and confirm **Current change**
3. Read that Change note only
4. Then the Tech Stack / Design System gates below
5. After the task: re-read the board. Do not invent the next step. Do not skip Changes. Do not touch production Auth until Change 1 is done on Staging.

Canonical Obsidian drop: `C:\Users\najee\OneDrive\Documents\GutGuard\One Account\`  
Do **not** edit `GutGuard Tech Stack/` or `GutGuard Design System/`.

# GutGuard — Tech Stack gate

Before scaffolding or changing app architecture, data, auth, deploy, or dependencies:

1. Read the Obsidian GutGuard Tech Stack (synced vault) — **READ ONLY**.
2. Do **not** edit, create, or delete files inside `GutGuard Tech Stack/` or `GutGuard Design System/`. Only the owner (Najee) may change those vaults. Implement in this product repo only.
3. Minimum Tech Stack reads:
   - `GutGuard Tech Stack/00 - OWNER — Read only.md`
   - `GutGuard Tech Stack/00 - GutGuard Tech Stack.md`
   - `GutGuard Tech Stack/01 - Canonical Stack.md`
   - `GutGuard Tech Stack/02 - Supabase Conventions.md` (data/auth)
   - `GutGuard Tech Stack/03 - Frontend Conventions.md` (UI engineering)
   - `GutGuard Tech Stack/04 - Deploy and Env.md` (Vercel / secrets)
4. Stack defaults for **new** systems:
   - Next.js App Router + TypeScript
   - Supabase (Auth + Postgres + RLS); no ORM
   - Vercel + npm + ESLint
   - Zod + React Hook Form
   - UI = Design System portable CSS — **no Tailwind, no shadcn**
5. Do not copy GEMA’s Tailwind/shadcn stack into this repo if this is a greenfield app.
6. Service role keys and other secrets: server / Vercel / Edge only — never `NEXT_PUBLIC_`.

Local Tech Stack path:
`d:\GutGuard\GutGuard Tech Stack\`

Auth for this product: email/password when Supabase env is set; `localStorage` mock only when env is empty. One Account plan: share GEMA Auth + OneGrinders and stop using mock as authorization. See `docs/obsidian/One Account/`.

Workflow: vault notes `07 - Using the Tech Stack with Cursor.md` and `05 - Playbook.md`.

# GutGuard UI — Design System gate

Before generating or changing any frontend (HTML, CSS, React, Stitch):

1. Read the Obsidian GutGuard Design System (synced vault) — **READ ONLY**.
2. Do **not** edit, create, or delete files inside `GutGuard Design System/`. Only the DS owner (Najee) may change the vault. Implement UI in this product repo only.
3. Minimum reads:
   - `GutGuard Design System/00 - OWNER — Read only.md`
   - `GutGuard Design System/00 - GutGuard Design System.md`
   - `GutGuard Design System/01 - Visual Foundations.md`
   - `GutGuard Design System/Foundations/Dialects.md`
   - `GutGuard Design System/Components/Index.md`
   - Component notes under `GutGuard Design System/Components/` for UI you touch
   - `GutGuard Design System/03 - Portable CSS Starter.md` for tokens/classes
4. Open `GutGuard Design System/Showcase/index.html` if unsure how a control should look.
5. Pick one dialect per screen (editorial / commerce / admin). Do not mix radius policies.
6. Visual source of truth = Doctors / vault — NOT boss prototypes (Academy, Lifestyle, etc.).
7. Recognition cues: bone `#F4F1EA`, blue `#0608A9`, ink `#0F0F18`, gold `#B08D5B`, Fraunces + Inter Tight, paper grain, uppercase micro-labels.

Local vault path:
`d:\GutGuard\GutGuard Design System\`

Lifestyle dialect map:
- Landing / welcome → editorial marketing + commerce CTAs
- Register → editorial booth
- Door card → editorial ceremonial
- Nearly free + member app + sheets → commerce

House spelling in UI copy: **Gutguard** (capital G only).

Workflow: vault `07 - Using the DS with Cursor.md` and `05 - Playbook.md`.
