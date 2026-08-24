---
title: Bien To Do
aliases:
  - Bien To Do
  - Gutguard Lifestyle board
tags:
  - gutguard
  - moc
  - lifestyle
---

# Bien To Do

Folder note for the Gutguard Lifestyle board.

Drop this **folder** at:

`C:\Users\najee\OneDrive\Documents\Obsidian Vault\Bien To Do\`

If `Bien To Do.md` still sits at the vault root as a **file**, rename that file first (Obsidian cannot keep a file and a folder with the same name). Then copy this folder in.

```mermaid
flowchart LR
  L["[[Epic 1 Landing|Epic 1 /]]"] --> R["[[Epic 2 Register|Epic 2 /register]]"]
  R --> C["[[Epic 3 Door Card|Epic 3 /card]]"]
  C --> N["/nearly"]
  N --> H["[[Epic 4 Member Hub|Epic 4 /app]]"]
  H --> A["[[Epic 5 Admin RBAC|Epic 5 /admin]]"]
  A --> U["[[Epic 6 User Lifecycle|Epic 6 /admin/users]]"]
```

## Notes in this folder

- [[00 - Locks]] — HCI + stack locks on every task
- [[01 - Part 1 End-User Journey]] — journey narrative
- [[Epic 1 Landing]] — `/` and `/welcome`
- [[Epic 2 Register]] — `/register` Auth & Zod
- [[Epic 3 Door Card]] — `/card` door interaction
- [[Epic 4 Member Hub]] — `/app/*` + BASE gating
- [[Epic 5 Admin RBAC]] — `/admin/*` cookie + `lifestyle_is_admin()`
- [[Epic 6 User Lifecycle]] — `/admin/users` member directory

## Vaults (read only)

- [[00 - OWNER — Read only]]
- [[00 - GutGuard Design System]] · [[01 - Visual Foundations]] · [[Foundations/Dialects]]
- [[00 - GutGuard Tech Stack]] · [[01 - Canonical Stack]] · [[02 - Supabase Conventions]]

House spelling in UI: **Gutguard**.
