---
title: 00 - Locks
tags:
  - gutguard
  - hci
  - stack
---

# Locks

Every task in [[Bien To Do]] inherits these. They are also written onto each task.

## HCI

| Constraint | Rule |
|---|---|
| Touch target | Minimum **44px × 44px** on every tap/click control. |
| Focus | Visible `:focus-visible` outline using **`var(--gold)`** (`#B08D5B`; portable alias `--gg-gold`). Never remove the outline without an equivalent. |
| ARIA | `aria-invalid`, `aria-describedby`, `aria-live`, `aria-expanded`, `aria-busy`, `aria-current`, `aria-modal` as the control requires. |
| Disabled | Never opacity-alone. Bone-soft fill **and** ink-4 text. |
| Motion | Honor `prefers-reduced-motion` on flip, confetti, drawers, welcome, spinners. |
| Copy | Uppercase micro-labels. Fraunces display, Inter Tight UI. **Gutguard** spelling. |

## Stack

| Layer | Rule |
|---|---|
| Framework | Next.js **App Router only**. Pages router forbidden. |
| Language | Strict TypeScript. |
| Auth | Cookie sessions via `@supabase/ssr`, refreshed in `proxy.ts`. Not `localStorage` as authorization. |
| Data | Supabase Postgres + **RLS**. No Prisma, Drizzle, or any ORM. |
| Forms | Zod + react-hook-form + `@hookform/resolvers`. Re-validate in Server Actions. |
| UI | GutGuard portable CSS custom properties. **No Tailwind. No shadcn.** |
| Icons | `lucide-react` outline, consistent stroke. |
| Secrets | Service role and `admin.ts` server-only. Never `NEXT_PUBLIC_`. Never process payments in the browser. |
| Dialects | One dialect per screen. Do not mix radius policies. |

## Dialect map

| Screen | Dialect |
|---|---|
| Landing / welcome | Editorial marketing + commerce CTAs |
| Register | Editorial booth |
| Door card | Editorial ceremonial |
| Nearly free + member app + sheets | Commerce |
| Admin `/admin/*` | Admin (square radii, dense table) |

Canonical shell **900px**. Mobile column ~440px. Desktop shell ~1240–1320px.
