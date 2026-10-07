# Prototype port: Lifestyle (Addendum 05)

`components/prototype/LifestyleMember.jsx` (`/app`) and `LifestyleLanding.jsx` (`/`) are generated from the approved prototypes. Change the prototype, then port again.

1. Put the assembled prototypes in `docs/prototype/` (`lifestyle-member.prototype.jsx`, `lifestyle-landing.prototype.jsx`).
2. From `docs/prototype/`: `python3 port_lifestyle.py lifestyle-member.prototype.jsx ../../components/prototype/LifestyleMember.jsx` and `python3 port_landing.py lifestyle-landing.prototype.jsx ../../components/prototype/LifestyleLanding.jsx`.
3. A failing step means the prototype changed at that line. Update the matching `rep(...)`.
4. Test:
   - once: `npm i -D playwright && npx playwright install chromium`;
   - `npm test`, `npm run build`, then `npx next start -p 3101`;
   - `node docs/prototype/test_landing.js` (sign-up, log-in, redirects, widths; runs in the repo's mock mode, without Supabase settings);
   - `bash docs/prototype/harness/build.sh && node docs/prototype/test_member_live.js` (the member page with a real-looking member, saves stubbed);
   - `node docs/prototype/speed_check.js http://localhost:3101/ "http://localhost:3101/?login" http://localhost:3101/app` (speed budget; a logged-in /app needs Supabase).

What the port changes (production default; `NEXT_PUBLIC_PROTOTYPE_DEMO=1` restores the demo):
- Member page shows the signed-in member's own data (`lib/lifestyle/load-prototype-member.ts`): name, card number, E-Points, stage, plan, doses, dose history, approved Stories of Hope. No demo people or demo history.
- Saves: doses (`persistDose`, Midday saved as `midday`), adjusted dose (`saveMyDose`), Gut Guardian (`markGutGuardian`), Story of Hope (`persistStory`, pending moderation).
- Landing uses One Account: sign-up adds email and password; the 6-digit code comes by email; log-in is email or OneGrinders username + password.
- Plan changes (change goal, skip, pause, payment method, cancel) and reward redemptions are saved as **requests** in `member_requests` for Gutguard staff to confirm. The member sees "Request sent", never "done".
- Kept on the phone only: weekly check-in, reminder times.
- Not wired yet (shown empty or hidden): My Team (GEMA), plans paid for family, sponsor links, the ₱499 trial credit, photo proof upload, push reminders.
- `?login` opens Log in (a logged-out visit to `/app` goes there); `?join` opens Sign up (from the website's Done screen).
