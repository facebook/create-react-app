/**
 * The panel end to end in a browser: signing in, the fleet, a booking, and
 * the tabs either side of them.
 *
 *   node tools/test-ui.js http://127.0.0.1:8210 admin@example.com password
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');

// Taken from the command line, like every other suite here. These were once
// written into the file, along with one particular machine's scratch
// directory, so the suite only ran for whoever had that exact account.
const BASE = process.argv[2] || 'http://127.0.0.1:8210';
const EMAIL = process.argv[3];
const PASSWORD = process.argv[4];
const OUT = process.env.SHOT_DIR || '/tmp';

let pass = 0, fail = 0;
const ok  = (l) => { pass++; console.log(`  ok    ${l}`); };
const bad = (l, d) => { fail++; console.log(`  FAIL  ${l}${d ? ' — ' + d : ''}`); };
const is  = (l, a, b) => (String(a) === String(b) ? ok(l) : bad(l, `expected ${b}, got ${a}`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await br.newContext({ viewport: { width: 1400, height: 1000 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  // Two benign categories are filtered: Google Fonts is blocked by this
  // container's network policy, and the 422 is the duplicate-registration
  // rejection that one of the assertions below deliberately provokes.
  const benign = t => t.includes('favicon')
    || t.includes('ERR_CONNECTION_RESET')
    // The web font is fetched from Google. A sandbox that proxies HTTPS with
    // its own certificate fails that request, and nothing in the panel can
    // answer for a certificate it does not issue.
    || t.includes('ERR_CERT_AUTHORITY_INVALID')
    || t.includes('status of 422');
  p.on('console', m => { if (m.type() === 'error' && !benign(m.text())) errs.push('console: ' + m.text()); });

  console.log('\n-- access control --');
  await p.goto(`${BASE}/dashboard.php`, { waitUntil: 'networkidle' });
  is('dashboard redirects to sign in when signed out', new URL(p.url()).pathname, '/index.php');

  console.log('\n-- sign in --');
  await p.fill('#email', EMAIL);
  await p.fill('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  is('lands on the dashboard', new URL(p.url()).pathname, '/dashboard.php');
  // Whoever signed in, not one particular account: the panel has to name the
  // person and their role, and the suite runs against whatever account it is
  // given.
  const who = await p.locator('.ns-who').innerText().catch(() => '');
  who.trim().length > 0 ? ok('signed-in name shown') : bad('signed-in name shown', '(empty)');
  /admin|super|accounts|auditor|staff/i.test(who) ? ok('role shown') : bad('role shown', who);

  console.log('\n-- fleet loads from the database --');
  await p.click('.admin-tab[data-tab="cars"]');
  await p.waitForTimeout(600);
  const before = await p.locator('.car-admin-card').count();
  console.log(`       vehicles currently listed: ${before}`);

  console.log('\n-- add a vehicle through the form --');
  const reg = 'UI' + Date.now().toString().slice(-8);
  await p.click('#addCarBtn');
  await p.waitForTimeout(300);
  await p.fill('#carBrand', 'Toyota');
  await p.fill('#carName', 'Glanza — G');
  await p.fill('#carRegNumber', reg);
  await p.selectOption('#carBodyType', 'Hatchback');
  await p.fill('#carSeats', '5');
  await p.fill('#carYear', '2024');
  await p.fill('#carPrice', '2600');
  await p.fill('#carPrice7', '17000');
  await p.fill('#carPrice15', '32000');
  await p.fill('#carPrice30', '58000');
  await p.fill('#carKmLimit', '200');
  await p.fill('#carExtraKmRate', '9');
  await p.fill('#carSecurityDeposit', '5000');
  await p.fill('#carCurrentKm', '15000');
  await p.click('#carForm button[type="submit"]');
  await p.waitForTimeout(1200);

  const after = await p.locator('.car-admin-card').count();
  is('vehicle count increased by one', after, before + 1);
  const text = await p.locator('#carAdminGrid').innerText();
  text.includes(reg) ? ok('new vehicle shows its registration') : bad('new vehicle shows its registration');
  text.includes('₹2,600') ? ok('daily rate rendered') : bad('daily rate rendered');

  console.log('\n-- it really persisted (reload from the server) --');
  await p.reload({ waitUntil: 'networkidle' });
  await p.click('.admin-tab[data-tab="cars"]');
  await p.waitForTimeout(700);
  const afterReload = await p.locator('#carAdminGrid').innerText();
  afterReload.includes(reg) ? ok('vehicle survives a reload') : bad('vehicle survives a reload');

  console.log('\n-- server-side validation surfaces in the UI --');
  await p.click('#addCarBtn');
  await p.waitForTimeout(300);
  await p.fill('#carBrand', 'Dup');
  await p.fill('#carName', 'Duplicate test');
  await p.fill('#carRegNumber', reg);          // same registration
  await p.fill('#carSeats', '5');
  await p.fill('#carYear', '2024');
  await p.fill('#carPrice', '1000');
  await p.fill('#carKmLimit', '200');
  await p.fill('#carExtraKmRate', '5');
  await p.fill('#carSecurityDeposit', '1000');
  await p.fill('#carCurrentKm', '0');
  // The panel says this in its own dialog now, not the browser's.
  await p.click('#carForm button[type="submit"]');
  let alertText = '';
  try {
    await p.waitForSelector('#nsDialog:not([hidden])', { timeout: 5000 });
    alertText = await p.locator('#nsDialog .modal').innerText();
    await p.click('#nsDialog [data-ns="go"]');
    await p.waitForTimeout(400);
  } catch { /* nothing was said, which the assertion below reports */ }
  alertText.toLowerCase().includes('registration')
    ? ok('duplicate registration reported to the user')
    : bad('duplicate registration reported to the user', alertText || '(no dialog)');

  await p.screenshot({ path: `${OUT}/p1_vehicles.png` });

  console.log('\n-- sign out --');
  await p.locator('#carModalCancel').click().catch(() => {});
  await p.waitForTimeout(200);
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle' }),
    p.click('.logout-form button[type="submit"]'),
  ]);
  is('signing out returns to the sign-in page', new URL(p.url()).pathname, '/index.php');
  await p.goto(`${BASE}/dashboard.php`, { waitUntil: 'networkidle' });
  is('dashboard no longer reachable after signing out', new URL(p.url()).pathname, '/index.php');

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
