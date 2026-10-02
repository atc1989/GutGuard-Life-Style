// The ported member page with a real-looking member (production mode, database calls stubbed).
const { chromium } = require('playwright');
const H = 'file://' + __dirname + '/harness/index.html';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [w, h] of [[390, 844], [1280, 900]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(H); await p.waitForTimeout(1200);
    const body = await p.locator('body').innerText();
    ok(/Kumusta, Maria/.test(body), `${w}: greets the member by name`);
    ok(!/Rey Aquino|Lola Remy|Lorna Aquino|0240 5578|1,247|•••• 4242/.test(body), `${w}: no demo people, card number or counts`); if (w > 900) ok(/0240 1111 2222 3333/.test(body), `${w}: member's own card number`);
    ok(!(await p.getByText('DEMO · MEMBER STAGE').isVisible().catch(() => false)), `${w}: demo bar hidden`);
    ok(/GUT GUARDIAN/.test(body), `${w}: member on a plan shows GUT GUARDIAN`);
    ok(/\b42\b/.test(body), `${w}: E-Points from the profile (42)`);
    const doses = (await p.locator('.lw-dose:not(.lw-set)').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').slice(0, 40));
    ok(doses.length === 3 && doses.every((d) => /2 capsules/.test(d)), `${w}: Full recovery 2 + 2 + 2 cards: ${JSON.stringify(doses)}`);
    if (w === 390) {
      await p.locator('.lw-done').first().click(); await p.waitForTimeout(400);
      const calls = await p.evaluate(() => window.__calls);
      const d = calls.find((c) => c[0] === 'persistDose');
      ok(d && /^\d{4}-\d{2}-\d{2}$/.test(d[1]) && d[2] === 'morning' && d[3] === true, 'dose saved: ' + JSON.stringify(d));
      await p.locator('.lw-done').first().click(); await p.waitForTimeout(400);
      const d2 = (await p.evaluate(() => window.__calls)).filter((c) => c[0] === 'persistDose')[1];
      ok(d2 && d2[2] === 'midday', 'Midday saved as "midday": ' + JSON.stringify(d2));
      await p.getByLabel('Settings').click(); await p.waitForTimeout(400);
      await p.getByLabel('One more capsule at Taps').click(); await p.getByText('Save changes').click(); await p.waitForTimeout(400);
      const sd = (await p.evaluate(() => window.__calls)).find((c) => c[0] === 'saveMyDose');
      ok(sd && sd[1].dreams === 3 && sd[1].morning === 2 && sd[1].lunch === 2, 'adjusted dose saved: ' + JSON.stringify(sd));
      await p.locator('.lw-tab').nth(1).click(); await p.waitForTimeout(500);
      const t2 = await p.locator('body').innerText();
      ok(/Mas maganda ang tulog ko/.test(t2) && /Lorna/.test(t2), 'Stories of Hope from the database feed');
      await p.screenshot({ path: __dirname + '/shots/member-live-stories.png' });
    } else await p.screenshot({ path: __dirname + '/shots/member-live-desk.png' });
    await p.context().close();
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close(); console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
})();
