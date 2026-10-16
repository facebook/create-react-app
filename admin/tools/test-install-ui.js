/**
 * Drives the first-run installer the way a person deploying the panel does:
 * open it in a browser, fill it in, and end up signed in.
 *
 *   node tools/test-install-ui.js http://127.0.0.1:8210 <db-name> <db-user>
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = process.argv[2] || 'http://127.0.0.1:8210';
const DB   = process.argv[3] || 'nitesha_install';
const DBU  = process.argv[4] || 'root';
const SHOT_DIR = process.env.SHOT_DIR || '/tmp';

let pass = 0, fail = 0;
const ok  = (l) => { pass++; console.log(`  ok    ${l}`); };
const bad = (l, d) => { fail++; console.log(`  FAIL  ${l}${d ? ' — ' + d : ''}`); };
const has = (l, text, needle) =>
  (String(text).toLowerCase().includes(String(needle).toLowerCase())
    ? ok(l) : bad(l, `"${needle}" not in view`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 900, height: 1200 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));

  const email = 'owner@niteshacars.in';
  const password = 'a-long-enough-passphrase';

  console.log('-- the installer checks the hosting first --');
  await p.goto(`${BASE}/install.php`, { waitUntil: 'networkidle' });
  const checks = await p.locator('.install-checks').innerText();
  has('reports the PHP version', checks, 'PHP');
  has('checks for MySQL support', checks, 'pdo_mysql');
  const failed = await p.locator('.install-checks li.no').count();
  failed === 0 ? ok('this environment passes every check') : bad('environment checks', `${failed} failed`);
  await p.screenshot({ path: `${SHOT_DIR}/install_form.png`, fullPage: true });

  console.log('\n-- it refuses details that cannot work --');
  await p.fill('#db_name', 'no_such_database');
  await p.fill('#db_user', DBU);
  await p.fill('#admin_name', 'Niteesh');
  await p.fill('#admin_email', email);
  await p.fill('#admin_password', password);
  await p.fill('#admin_password2', password);
  await p.click('button[type="submit"]');
  await p.waitForTimeout(1200);
  has('a wrong database is reported, not a stack trace',
      await p.locator('.install-errors').innerText(), 'could not connect');

  console.log('\n-- mismatched passwords --');
  await p.fill('#db_name', DB);
  await p.fill('#db_user', DBU);
  await p.fill('#admin_name', 'Niteesh');
  await p.fill('#admin_email', email);
  await p.fill('#admin_password', password);
  await p.fill('#admin_password2', 'something-else-entirely');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(900);
  has('mismatched passwords are caught',
      await p.locator('.install-errors').innerText(), 'do not match');

  console.log('\n-- a short password --');
  await p.fill('#db_name', DB);
  await p.fill('#db_user', DBU);
  await p.fill('#admin_name', 'Niteesh');
  await p.fill('#admin_email', email);
  await p.fill('#admin_password', 'short');
  await p.fill('#admin_password2', 'short');
  await p.evaluate(() => document.querySelector('#admin_password').removeAttribute('minlength'));
  await p.click('button[type="submit"]');
  await p.waitForTimeout(900);
  has('a short password is refused',
      await p.locator('.install-errors').innerText(), 'at least 10');

  console.log('\n-- the real thing --');
  await p.fill('#db_name', DB);
  await p.fill('#db_user', DBU);
  await p.fill('#site_origin', 'https://niteshacars.in https://www.niteshacars.in');
  await p.fill('#admin_name', 'Niteesh');
  await p.fill('#admin_email', email);
  await p.fill('#admin_password', password);
  await p.fill('#admin_password2', password);
  await p.click('button[type="submit"]');
  await p.waitForTimeout(2500);
  const done = await p.locator('.login-card').innerText();
  has('the tables were created', done, '001_schema.sql');
  has('the account was created', done, 'account was created');
  has('config.php was written', done, 'config.php was written');
  has('and it says to delete the installer', done, 'delete');
  await p.screenshot({ path: `${SHOT_DIR}/install_done.png`, fullPage: true });

  console.log('\n-- it will not run a second time --');
  await p.goto(`${BASE}/install.php`, { waitUntil: 'networkidle' });
  const again = await p.locator('.login-card').innerText();
  has('the installer stands down once an account exists', again, 'already installed');
  (await p.locator('#db_name').count()) === 0
    ? ok('no form is offered')
    : bad('no form is offered', 'the database form is still there');

  console.log('\n-- sign in with the account it made --');
  await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
  await p.fill('#email', email);
  await p.fill('#password', password);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  new URL(p.url()).pathname === '/dashboard.php'
    ? ok('signed in to a freshly installed panel')
    : bad('signed in', p.url());
  has('as the Super Admin', await p.locator('.ns-who').first().innerText(), 'Niteesh');

  console.log('\n-- the panel works on an empty database --');
  for (const tab of ['dashboard', 'bookings', 'cars', 'inquiries', 'finance', 'reports']) {
    await p.click(`.admin-tab[data-tab="${tab}"]`);
    await p.waitForTimeout(500);
    (await p.locator(`#panel-${tab}`).isVisible()) ? ok(`${tab} renders`) : bad(`${tab} renders`);
  }
  await p.screenshot({ path: `${SHOT_DIR}/fresh_dashboard.png` });

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
