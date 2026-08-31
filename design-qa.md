# Design QA — Desktop shell consolidation

- Source evidence: `C:\Users\najee\AppData\Local\Temp\codex-clipboard-db57d416-f5a2-49f7-abb9-3a6ca78ffebf.png`
- Target state: one desktop brand in the sidebar; one desktop account trigger in the sidebar footer; Notifications, Settings, QR, and Sign out consolidated in its popup; mobile masthead and account sheet retained.
- Code checks: ESLint passed; 52 tests passed; production Next.js build passed; `git diff --check` passed.

## Implemented corrections

- Desktop masthead is hidden at the canonical 900px sidebar breakpoint, removing the duplicate brand, avatar, and separate notification bell.
- Sidebar identity row is now the sole desktop account trigger.
- Persistent sidebar Settings and Sign out controls were removed.
- Desktop account menu opens inward from the sidebar and contains Notifications, Settings, My QR code, and Sign out.
- Mobile masthead keeps one brand and one account avatar; notifications are available inside the mobile account sheet.
- Account notification counts have accessible labels, and menu focus/arrow/Escape behavior remains intact.

## Verification limitation

The in-app browser blocked the local `http://localhost:3000/app/story` page under its URL security policy, so a fresh same-viewport implementation screenshot and pixel comparison could not be captured in this run. No alternate browser or indirect browser-control workaround was used.

final result: blocked
