/**
 * Drives an enquiry through the panel: it arrives from the public form, gets
 * contacted, noted, and accepted into a real booking.
 *
 *   node tools/test-enquiry-ui.js http://127.0.0.1:8210 admin@example.com password
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execFileSync } = require('child_process');

const BASE = process.argv[2] || 'http://127.0.0.1:8210';
const EMAIL = process.argv[3];
const PASSWORD = process.argv[4];
const SHOT_DIR = process.env.SHOT_DIR || '/tmp';

let pass = 0, fail = 0;
const ok = (l) => { pass++; console.log(`  ok    ${l}`); };
const bad = (l, d) => { fail++; console.log(`  FAIL  ${l}${d ? ' — ' + d : ''}`); };
const has = (l, text, needle) =>
  (String(text).toLowerCase().includes(String(needle).toLowerCase())
    ? ok(l) : bad(l, `"${needle}" not in view`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 1400, height: 1100 } })).newPage();

  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => {
    const t = m.text();
    // ERR_CERT_AUTHORITY_INVALID is the web font: fetched from Google, and
    // refused by any sandbox that proxies HTTPS with its own certificate.
    if (m.type() === 'error' && !t.includes('ERR_CONNECTION_RESET') && !t.includes('favicon')
        && !t.includes('ERR_CERT_AUTHORITY_INVALID')
        && !/status of (409|422|429)/.test(t)) errs.push('console: ' + t);
  });

  // The panel asks in its own dialog now, not the browser's, so answering it
  // means driving the page rather than listening for a dialog event. Same
  // queue as before: true presses the confirming button, a string is typed
  // (or selected) first, and anything unanswered is cancelled.
  let dialogAnswers = [];
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
      const next = dialogAnswers.shift();
      const asked = await p.locator('#nsDialog .modal').innerText().catch(() => '');
      try {
        if (next === undefined || next === false) {
          await p.click('#nsDialog [data-ns="cancel"]');
        } else {
          if (next !== true) {
            const select = await p.$('#nsDialog #nsDialogSelect:not([hidden])');
            if (select) await select.selectOption(String(next));
            else await p.fill('#nsDialog #nsDialogInput', String(next));
          }
          await p.click('#nsDialog [data-ns="go"]');
        }
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

  // Local suites all post from 127.0.0.1 and share one rate-limit window; an
  // earlier run would otherwise throttle this one.
  //
  // Its output is shown rather than swallowed. It needs the same database
  // this panel is reading, and when it could not find one it used to say so
  // into /dev/null -- which read, three assertions later, as the public form
  // refusing a perfectly good enquiry.
  try {
    execFileSync('php', [__dirname + '/clear-enquiry-throttle.php'], { stdio: 'inherit' });
  } catch {
    bad('the rate-limit window could not be cleared',
      'set NITESHA_CONFIG to the panel config this server is using');
  }

  const stamp = Date.now().toString().slice(-6);
  const customer = `Meena R ${stamp}`;

  // An enquiry arrives from the public site, exactly as the form would send it.
  //
  // Posted from outside a page rather than with fetch() inside one. The
  // endpoint refuses an Origin that is not the public site's, which is the
  // point of it -- and a browser posting from the panel's own address sends
  // exactly such an Origin. A request with no Origin is what the endpoint
  // allows through, and is as close to the visitor's post as this can get
  // without serving the public site here too.
  const posted = await p.request.post(`${BASE}/api/enquiry-submit.php`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      name: customer, phone: '9876500' + Math.floor(Math.random() * 900 + 100),
      email: 'meena@example.com',
      message: 'Need a car for three days in December',
      pickup_location: 'Nagercoil',
      start_date: '2026-12-10', return_date: '2026-12-13',
    },
  });
  const submitted = { status: posted.status(), body: await posted.json().catch(() => ({})) };

  submitted.status === 201 ? ok('public form accepted the enquiry') : bad('public form accepted', submitted.status);
  submitted.body.enquiry_number ? ok(`reference issued (${submitted.body.enquiry_number})`) : bad('reference issued');

  await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
  await p.fill('#email', EMAIL);
  await p.fill('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  ok('signed in');

  console.log('\n-- it shows up in the panel --');
  await p.click('.admin-tab[data-tab="inquiries"]');
  await p.waitForTimeout(900);
  let listText = await p.locator('#inquiriesWrap').innerText();
  has('the enquiry is listed', listText, customer);
  has('with its reference', listText, 'ENQ-');
  has('marked New', listText, 'New');

  const stats = await p.locator('#enquiryStats').innerText();
  has('the counts are shown above the list', stats, 'Total');
  has('and one for the new ones', stats, 'New');

  console.log('\n-- search and filter --');
  // Waited for rather than slept through: typing debounces for 300ms and
  // then fetches, and a fixed 800ms was close enough to that to fail on a
  // slow morning.
  const searched = (q) => p.waitForResponse(
    (r) => r.url().includes('enquiries.php') && r.url().includes(`q=${q}`),
    { timeout: 10000 },
  );
  await Promise.all([searched(stamp), p.fill('#enquirySearch', stamp)]);
  await p.waitForTimeout(400);
  has('search narrows the list', await p.locator('#inquiriesWrap').innerText(), customer);
  await p.fill('#enquirySearch', '');
  await p.waitForTimeout(900);
  await p.click('#enquiryChips [data-chip="Converted"]');
  await p.waitForTimeout(800);
  const converted = await p.locator('#inquiriesWrap').innerText();
  converted.includes(customer)
    ? bad('filtering to Converted hides a New enquiry')
    : ok('filtering to Converted hides a New enquiry');
  await p.click('#enquiryChips [data-chip=""]');
  await p.waitForTimeout(800);

  console.log('\n-- open it --');
  await p.locator('#inquiriesWrap tbody tr').filter({ hasText: customer }).first().click();
  await p.waitForTimeout(900);
  let detail = await p.locator('#enquiryDetailView').innerText();
  has('shows what they asked for', detail, 'three days in December');
  has('shows the pickup location', detail, 'Nagercoil');
  has('shows the dates', detail, 'Dec 2026');

  console.log('\n-- handling --');
  dialogAnswers = ['Called back, wants an automatic'];
  await p.locator('[data-enq-status="Contacted"]').click();
  await p.waitForTimeout(1100);
  has('now marked Contacted', await p.locator('.rec-hero').innerText(), 'Contacted');
  // Notes have a tab of their own, and it says how many are on the record.
  has('the tab counts the notes', await p.locator('.rec-tab[data-pane="notes"]').innerText(), '1');
  await p.locator('.rec-tab[data-pane="notes"]').click();
  await p.waitForTimeout(300);
  detail = await p.locator('#enquiryDetailView').innerText();
  has('the note is kept', detail, 'wants an automatic');

  dialogAnswers = ['Confirmed budget'];
  await p.locator('#enqAddNote').click();
  await p.waitForTimeout(1000);
  detail = await p.locator('#enquiryDetailView').innerText();
  has('notes are appended, not replaced', detail, 'wants an automatic');
  has('and the new one is there too', detail, 'Confirmed budget');

  await p.screenshot({ path: `${SHOT_DIR}/enquiry_detail.png` });

  console.log('\n-- accept it into a booking --');
  // A vehicle to book it against.
  const reg = 'EU' + stamp;
  await p.click('#enquiryDetailBack');
  await p.click('.admin-tab[data-tab="cars"]');
  await p.waitForTimeout(600);
  await p.click('#addCarBtn');
  await p.waitForTimeout(250);
  for (const [sel, val] of [['#carBrand', 'Toyota'], ['#carName', 'Glanza — enquiry test'],
                            ['#carRegNumber', reg], ['#carSeats', '5'], ['#carYear', '2024'],
                            ['#carPrice', '2400'], ['#carKmLimit', '180'], ['#carExtraKmRate', '7'],
                            ['#carSecurityDeposit', '4000'], ['#carCurrentKm', '30000']]) {
    await p.fill(sel, val);
  }
  await p.click('#carForm button[type="submit"]');
  await p.waitForTimeout(1000);

  await p.click('.admin-tab[data-tab="inquiries"]');
  await p.waitForTimeout(900);
  await p.locator('#inquiriesWrap tbody tr').filter({ hasText: customer }).first().click();
  await p.waitForTimeout(900);
  await p.click('#enqConvert');
  await p.waitForTimeout(600);

  const prefilledName = await p.locator('#bkCustomerName').inputValue();
  prefilledName === customer ? ok('booking form pre-filled from the enquiry') : bad('booking form pre-filled', prefilledName);
  const prefilledStart = await p.locator('#bkStartDate').inputValue();
  prefilledStart === '2026-12-10' ? ok('requested dates carried across') : bad('dates carried across', prefilledStart);

  await p.selectOption('#bkVehicle', { label: `Glanza — enquiry test (${reg})` });
  await p.fill('#bkStartTime', '10:00');
  await p.fill('#bkReturnTime', '10:00');
  await p.fill('#bkLicence', 'TN0120230077777');
  await p.fill('#bkRentalAmount', '7200');
  dialogAnswers = [true];
  await p.click('#bookingForm button[type="submit"]');
  await p.waitForTimeout(1600);

  console.log('\n-- the link both ways --');
  await p.click('.admin-tab[data-tab="inquiries"]');
  await p.waitForTimeout(900);
  listText = await p.locator('#inquiriesWrap').innerText();
  has('the enquiry is now Converted', listText, 'Converted');
  has('and shows its booking number', listText, 'NSC-');

  await p.click('.admin-tab[data-tab="bookings"]');
  await p.waitForTimeout(900);
  // Asked for by name. The list shows one page of thirty by hire date, and
  // the other suites leave bookings dated into 2027 -- enough to push this
  // one off the page and fail a test of the enquiry, not of the list.
  await p.fill('#bookingSearch', customer);
  await p.waitForFunction(
    (name) => [...document.querySelectorAll('#bookingListWrap tbody tr')]
      .some((r) => r.innerText.includes(name)),
    customer, { timeout: 10000 },
  ).catch(() => {});
  has('the booking exists under the customer', await p.locator('#bookingListWrap').innerText(), customer);

  console.log('\n-- other tabs still render --');
  for (const tab of ['dashboard', 'cars', 'finance', 'reports']) {
    await p.click(`.admin-tab[data-tab="${tab}"]`);
    await p.waitForTimeout(600);
    (await p.locator(`#panel-${tab}`).isVisible()) ? ok(`${tab} renders`) : bad(`${tab} renders`);
  }

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
