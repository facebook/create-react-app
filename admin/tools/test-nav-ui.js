/**
 * Getting from one panel to another, by every route the panel offers: the
 * sidebar, the dashboard's quick actions, a link carrying a #panel, a refresh,
 * and the back button.
 *
 * The quick actions work by setting location.hash, so on a page that is
 * already open they are a same-document navigation — the address bar changes
 * and hashchange fires, and that is all. Until shell.js listened for it, all
 * three of those buttons moved the address bar and left the Dashboard on
 * screen, which is what "some buttons not taking to the pages" was.
 *
 *   node tools/test-nav-ui.js http://127.0.0.1:8210 admin@example.com password
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = process.argv[2] || 'http://127.0.0.1:8210';
const EMAIL = process.argv[3];
const PASSWORD = process.argv[4];

let pass = 0, fail = 0;
const ok = (l, d) => { pass++; console.log(`  ok    ${l.padEnd(44)}${d || ''}`); };
const bad = (l, d) => { fail++; console.log(`  FAIL  ${l}${d ? ' — ' + d : ''}`); };
const is = (l, got, want) =>
  (String(got) === String(want) ? ok(l, got) : bad(l, `expected ${want}, got ${got}`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 1500, height: 1100 } })).newPage();

  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  // The panel's own dialog now; walk away from whatever it asks.
  (async function answerDialogs() {
    for (;;) {
      try { await p.waitForSelector('#nsDialog:not([hidden])', { timeout: 0 }); }
      catch {
        // Signing in navigates, which tears down the wait. Only a closed
        // page means there is nothing left to answer.
        if (p.isClosed()) return;
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      const asked = await p.locator('#nsDialog .modal').innerText().catch(() => '');
      try {
        await p.click('#nsDialog [data-ns="cancel"]');
        // Until this question is gone: either the dialog closed, or the
        // next one replaced it. Waiting only for [hidden] misses a close
        // followed immediately by another question -- the element never
        // reads as hidden, and the wait costs its whole timeout.
        await p.waitForFunction((was) => {
          const el = document.querySelector('#nsDialog');
          if (!el || el.hidden) return true;
          return el.querySelector('.modal').innerText !== was;
        }, asked, { timeout: 5000 });
      } catch { /* answered or closed under us */ }
    }
  }());

  const DASH = `${BASE}/dashboard.php`;

  // What the browser is actually showing, as opposed to what it says it is.
  const showing = () => p.evaluate(() => ({
    panel: [...document.querySelectorAll('[id^="panel-"]')].filter(s => !s.hidden).map(s => s.id).join(','),
    tab: document.querySelector('.admin-tab.is-on')?.dataset.tab,
    hash: location.hash,
    title: document.getElementById('nsTitle')?.textContent.trim(),
  }));

  // A form left open sits over the sidebar and swallows the next click, so
  // every leg starts from a clean Dashboard.
  const toDashboard = async () => {
    await p.evaluate(() => document.querySelectorAll('.modal-overlay').forEach(m => { m.hidden = true; }));
    await p.click('.admin-tab[data-tab="dashboard"]');
    await p.waitForTimeout(300);
  };

  await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
  await p.fill('#email', EMAIL);
  await p.fill('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  await p.waitForTimeout(1000);
  ok('signed in');

  console.log('\n-- the sidebar --');
  for (const [tab, title] of [['bookings', 'Bookings'], ['cars', 'Vehicles'], ['inquiries', 'Inquiries'],
                              ['finance', 'Finance'], ['reports', 'Reports'], ['dashboard', 'Dashboard']]) {
    await p.click(`.admin-tab[data-tab="${tab}"]`);
    await p.waitForTimeout(700);
    const s = await showing();
    (s.panel === `panel-${tab}` && s.tab === tab && s.title === title)
      ? ok(`${tab} opens its panel, titled "${title}"`, s.hash)
      : bad(`${tab} opens its panel`, JSON.stringify(s));
  }

  console.log('\n-- the quick actions that go somewhere --');
  for (const q of ['bookings', 'finance', 'inquiries']) {
    await toDashboard();
    await p.click(`[data-quick="${q}"]`);
    await p.waitForTimeout(800);
    const s = await showing();
    s.panel === `panel-${q}` ? ok(`"${q}" arrives`, s.hash) : bad(`"${q}" went nowhere`, JSON.stringify(s));
  }

  console.log('\n-- the quick actions that open a form --');
  for (const [q, overlay] of [['booking', '#bookingModalOverlay'], ['vehicle', '#carModalOverlay']]) {
    await toDashboard();
    await p.click(`[data-quick="${q}"]`);
    await p.waitForTimeout(600);
    const open = await p.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? !el.hidden : [...document.querySelectorAll('.modal-overlay')].some(m => !m.hidden);
    }, overlay);
    open ? ok(`"${q}" opens its form`) : bad(`"${q}" opens its form`, 'nothing appeared');
  }

  console.log('\n-- a link straight to a panel --');
  // about:blank first: dashboard.php#inquiries to dashboard.php#reports is a
  // same-document navigation, so the page would not reload and the form left
  // open above would still be over the top of it.
  await p.goto('about:blank');
  await p.goto(`${DASH}#reports`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  is('arriving at #reports', (await showing()).panel, 'panel-reports');

  console.log('\n-- and the address bar keeps up --');
  await p.click('.admin-tab[data-tab="cars"]');
  await p.waitForTimeout(700);
  is('the hash follows the tab', (await showing()).hash, '#cars');
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  is('so a refresh stays put', (await showing()).panel, 'panel-cars');

  console.log('\n-- the back button --');
  await p.goto('about:blank');
  await p.goto(DASH, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  await p.evaluate(() => { location.hash = '#finance'; });
  await p.waitForTimeout(600);
  is('forward to Finance', (await showing()).panel, 'panel-finance');
  await p.goBack();
  await p.waitForTimeout(700);
  const back = await showing();
  back.panel === 'panel-dashboard'
    ? ok('and back to where it started', back.hash || '(no hash)')
    : bad('back to where it started', JSON.stringify(back));

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
