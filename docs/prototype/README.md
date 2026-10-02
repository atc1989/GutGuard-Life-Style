# Prototype port: Lifestyle (Addendum 05)

`components/prototype/LifestyleMember.jsx` (`/app`) and `LifestyleLanding.jsx` (`/`) are generated from the approved prototypes. Change the prototype, then port again.

1. Put the assembled prototypes in `docs/prototype/` (`lifestyle-member.prototype.jsx`, `lifestyle-landing.prototype.jsx`).
2. From `docs/prototype/`: `python3 port_lifestyle.py lifestyle-member.prototype.jsx ../../components/prototype/LifestyleMember.jsx` and `python3 port_landing.py lifestyle-landing.prototype.jsx ../../components/prototype/LifestyleLanding.jsx`.
3. A failing step means the prototype changed at that line. Update the matching `rep(...)`.
4. `npm run build`, `npm test`, then the two Playwright checks in this folder.

What the port changes (production default; `NEXT_PUBLIC_PROTOTYPE_DEMO=1` restores the demo):
- Member page shows the signed-in member's own data (`lib/lifestyle/load-prototype-member.ts`): name, card number, E-Points, stage, plan, doses, dose history, approved Stories of Hope. No demo people or demo history.
- Saves: doses (`persistDose`, Midday saved as `midday`), adjusted dose (`saveMyDose`), Gut Guardian (`markGutGuardian`), Story of Hope (`persistStory`, pending moderation).
- Landing uses One Account: sign-up adds email and password; the 6-digit code comes by email; log-in is email or OneGrinders username + password.
- Not wired yet (shown empty or hidden): My Team (GEMA), plans paid for family, sponsor links, plan changes (skip, pause, cancel), photo proof upload, reminders.
