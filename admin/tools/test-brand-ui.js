/**
 * The brand images on Website content.
 *
 * The slots are not all the same kind of picture. A page banner is framed to
 * a shape, because a wide band has to be wide. A logo is artwork with its own
 * margins, and framing one cuts the words off it -- a square frame around the
 * lockup is what turned "NiteSha Cars & Bikes" into "NiteSha CARS" on the
 * live site. So the logo is kept whole, and this is what says so.
 *
 *   node tools/test-brand-ui.js http://127.0.0.1:8210 admin@example.com password
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = process.argv[2] || 'http://127.0.0.1:8210';
const EMAIL = process.argv[3];
const PASSWORD = process.argv[4];

let pass = 0, fail = 0;
const ok = (l, d) => { pass++; console.log(`  ok    ${l.padEnd(46)}${d || ''}`); };
const bad = (l, d) => { fail++; console.log(`  FAIL  ${l}${d ? ' — ' + d : ''}`); };
const is = (l, got, want) => (String(got) === String(want) ? ok(l, got) : bad(l, `expected ${want}, got ${got}`));
const has = (l, text, needle) => (String(text).toLowerCase().includes(String(needle).toLowerCase())
  ? ok(l) : bad(l, `"${needle}" not in "${String(text).slice(0, 60)}"`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();

  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !t.includes('favicon') && !t.includes('ERR_CERT_AUTHORITY_INVALID')
        && !t.includes('ERR_CONNECTION_RESET')) errs.push('console: ' + t);
  });
  // The panel's own dialog now; say yes to whatever it asks.
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
        await p.click('#nsDialog [data-ns="go"]');
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

  await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
  await p.fill('#email', EMAIL);
  await p.fill('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  ok('signed in');

  // The slots sit inside a section that opens on click; opening every one is
  // simpler than knowing which.
  const openSections = async () => {
    await p.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
    await p.waitForTimeout(300);
  };
  const logo = () => p.locator('.brand-slot[data-slot="logo"]');
  const text = async (loc) => (await loc.textContent()).replace(/\s+/g, ' ').trim();

  await p.goto(`${BASE}/content.php`, { waitUntil: 'networkidle' });
  await openSections();

  console.log('\n-- the logo is not framed --');
  is('the slot is marked as kept whole', await logo().getAttribute('data-fit'), 'whole');
  is('and it is called what it is', await text(logo().locator('.brand-slot-label')), 'Logo');
  has('the caption says so', await text(logo().locator('.brand-slot-shape')), 'kept whole');
  has('and what it is scaled to fit', await text(logo().locator('.brand-slot-shape')), '1280×800');

  console.log('\n-- a wide logo keeps its proportions --');
  // Drawn here rather than shipped as a fixture: the point is the shape, and
  // 3:1 is wide enough that a square frame could not hide it.
  await p.evaluate(() => new Promise((done) => {
    const c = document.createElement('canvas');
    c.width = 1200;
    c.height = 400;
    const x = c.getContext('2d');
    x.fillStyle = '#F5A500';
    x.fillRect(40, 150, 1120, 100);
    c.toBlob((blob) => {
      const dt = new DataTransfer();
      dt.items.add(new File([blob], 'wide-logo.png', { type: 'image/png' }));
      const input = document.querySelector('.brand-slot[data-slot="logo"] .brand-slot-file');
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      done();
    }, 'image/png');
  }));
  await p.waitForTimeout(600);
  (await p.locator('#frameOverlay').isVisible())
    ? bad('no frame is offered for it', 'the framing dialog opened')
    : ok('no frame is offered for it');

  await p.waitForTimeout(2500);
  await openSections();
  const stored = await logo().locator('.brand-slot-preview img').evaluate((el) => ({
    w: el.naturalWidth, h: el.naturalHeight,
  }));
  const ratio = (stored.w / stored.h).toFixed(2);
  ratio === '3.00'
    ? ok('what was uploaded is what was stored', `${stored.w}×${stored.h}`)
    : bad('what was uploaded is what was stored', `3:1 went in, ${ratio}:1 came out (${stored.w}×${stored.h})`);
  is('no Edit button, since there is nothing to frame', await logo().locator('.brand-edit').count(), 0);
  is('but there is a way to remove it', await logo().locator('.brand-remove').count(), 1);

  console.log('\n-- a banner is still framed --');
  const hero = p.locator('.brand-slot[data-slot="cars-hero"]');
  has('its caption gives a shape', await text(hero.locator('.brand-slot-shape')), '16:5');
  await p.evaluate(() => new Promise((done) => {
    const c = document.createElement('canvas');
    c.width = 900;
    c.height = 900;
    const x = c.getContext('2d');
    x.fillStyle = '#0A0E20';
    x.fillRect(0, 0, 900, 900);
    c.toBlob((blob) => {
      const dt = new DataTransfer();
      dt.items.add(new File([blob], 'square.png', { type: 'image/png' }));
      const input = document.querySelector('.brand-slot[data-slot="cars-hero"] .brand-slot-file');
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      done();
    }, 'image/png');
  }));
  await p.waitForTimeout(900);
  (await p.locator('#frameOverlay').isVisible())
    ? ok('the framing dialog opens for it')
    : bad('the framing dialog opens for it');
  await p.click('#frameCancel');
  await p.waitForTimeout(300);

  console.log('\n-- removing one --');
  await openSections();
  await logo().locator('.brand-remove').scrollIntoViewIfNeeded();
  await logo().locator('.brand-remove').click();
  await p.waitForTimeout(2000);
  await openSections();
  is('the slot is empty again', await logo().locator('.brand-slot-preview img').count(), 0);
  has('and says so', await text(logo().locator('.brand-slot-preview')), 'Nothing yet');

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
