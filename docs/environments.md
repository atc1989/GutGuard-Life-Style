# Environments — GutGuard Lifestyle

Lifestyle is the hub. Custom domains were switched in place on 2026-09-12 (Preview/`staging` → Production). Do not remove and re-add the domain to “fix” it.

## Production

```text
lifestyle.gutguard.ph  →  Vercel Production (git branch main)
Auth / DB              →  rvwseybgimmewuoccecu
Git                    →  atc1989/GutGuard-Life-Style main
```

Rollback mapping (before 2026-09-12 assignment): Preview / Pre-Production of `staging`, Vercel SSO. Staging Preview deployments were not deleted.

## Staging

```text
gut-guard-life-style-git-staging-atcs-projects-2f85c923.vercel.app
  → Vercel Preview of git branch staging
  → Vercel Deployment Protection (SSO) enabled
Auth / DB → fxdsnacuonfvutdquogb
```

Staging is **not** `lifestyle.gutguard.ph` after 2026-09-12.

## Auth (no secrets)

- Cookie Domain `.gutguard.ph` on `*.gutguard.ph`; host-only on `*.vercel.app`
- Production `site_url` remains `https://gut-guard-theta.vercel.app/my-account` (intentional; do not change without a proven need)
- Redirect allow-list includes `lifestyle.gutguard.ph`, `gema.gutguard.ph`, `gentrep.gutguard.ph`
- Shared logout clears the session on all three hosts
- Production additive schema: `supabase/patches/20260912_production_additive.sql` (already applied; not a CLI migration)
