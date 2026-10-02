// Lifestyle landing + member page in the built app (no Supabase env = their mock mode).
const { chromium } = require('playwright');
const B = 'http://localhost:3101';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const page = async (path, w = 390) => { const p = await (await b.newContext({ viewport: { width: w, height: 844 } })).newPage(); p.on('pageerror', (e) => errs.push(path + ': ' + e.message)); await p.goto(B + path); await p.waitForTimeout(1500); return p; };
  let p = await page('/');
  ok(await p.getByText('Get my free card').first().isVisible(), 'landing: Get my free card');
  ok(!(await p.getByText('DEMO · LANDING').isVisible().catch(() => false)), 'landing: demo bar hidden');
  await p.getByText('Get my free card').first().click(); await p.waitForTimeout(400);
  ok(await p.locator('#gg-em').isVisible() && await p.locator('#gg-pw').isVisible(), 'sign-up: email and password fields');
  ok(!(await p.locator('#gg-cd').isVisible().catch(() => false)), 'sign-up: referral field hidden until sponsor links work');
  await p.fill('#gg-nm', 'Maria Santos'); await p.fill('#gg-no', '0917 111 2233'); await p.fill('#gg-em', 'maria@example.com'); await p.fill('#gg-pw', 'weak');
  await p.locator('input[type=checkbox]').first().check();
  ok(await p.getByRole('button', { name: 'Get my card' }).isDisabled(), 'weak password keeps the button off');
  await p.fill('#gg-pw', 'Strong123'); await p.waitForTimeout(100);
  ok(!(await p.getByRole('button', { name: 'Get my card' }).isDisabled()), 'strong password turns it on');
  await p.screenshot({ path: __dirname + '/shots/landing-signup.png' });
  await p.getByRole('button', { name: 'Get my card' }).click(); await p.waitForTimeout(1500);
  ok(/Your card is ready, Maria/.test(await p.locator('body').innerText()), 'mock mode: signUp ok -> welcome');
  await p.context().close();
  p = await page('/?login=1');
  ok(await p.locator('#gg-lg').isVisible() && await p.locator('#gg-lp').isVisible(), 'log in: email/username + password');
  await p.screenshot({ path: __dirname + '/shots/landing-login.png' });
  await p.context().close();
  p = await page('/app');
  ok(/Kumusta/.test(await p.locator('body').innerText()), '/app renders the member page');
  await p.context().close();
  p = await page('/app/health');
  ok(new URL(p.url()).pathname === '/app', '/app/health -> /app');
  await p.context().close();
  for (const w of [360, 1440]) { p = await page('/', w); const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `no side scroll at ${w}px`); await p.context().close(); }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close(); console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
})();
