/**
 * Drives a whole booking through the panel in a real browser: create it, take
 * a deposit and payments, hand the vehicle over and back, correct a misread
 * meter, refund the deposit and complete the booking.
 *
 *   node tools/test-booking-ui.js http://127.0.0.1:8210 admin@example.com password
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = process.argv[2] || 'http://127.0.0.1:8210';
const EMAIL = process.argv[3];
const PASSWORD = process.argv[4];
const SHOT_DIR = process.env.SHOT_DIR || '/tmp';

let pass = 0, fail = 0;
const ok = (l) => { pass++; console.log(`  ok    ${l}`); };
const bad = (l, d) => { fail++; console.log(`  FAIL  ${l}${d ? ' — ' + d : ''}`); };
// Status badges are uppercased by CSS, and innerText reflects that, so the
// comparison ignores case rather than asserting on presentation.
const has = (l, text, needle) =>
  (String(text).toLowerCase().includes(String(needle).toLowerCase())
    ? ok(l) : bad(l, `"${needle}" not in view`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 1400, height: 1100 } })).newPage();

  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  // Google Fonts is blocked in this container; nothing to do with the app.
  p.on('console', m => {
    const t = m.text();
    // ERR_CERT_AUTHORITY_INVALID is the web font: fetched from Google, and
    // refused by any sandbox that proxies HTTPS with its own certificate.
    if (m.type() === 'error' && !t.includes('ERR_CONNECTION_RESET') && !t.includes('favicon')
        && !t.includes('ERR_CERT_AUTHORITY_INVALID')
        && !/status of (409|422)/.test(t)) errs.push('console: ' + t);
  });

  // The panel asks in its own dialog now, not the browser's, so answering it
  // means driving the page rather than listening for a dialog event. Same
  // queue as before: true presses the confirming button, a string is typed
  // (or selected) first, an object fills a form dialog field by field, and
  // anything unanswered is cancelled.
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
            // A form dialog -- several fields at once -- is answered with an
            // object of {field: value}. See nsDialog.form in dialog.js.
            if (next && typeof next === 'object') {
              for (const [name, value] of Object.entries(next)) {
                const field = await p.$(`#nsDialog [data-name="${name}"]`);
                if (!field) continue;
                const tag = await field.evaluate((n) => n.tagName);
                if (tag === 'SELECT') await field.selectOption(String(value));
                else await field.fill(String(value));
              }
            } else {
              const select = await p.$('#nsDialog #nsDialogSelect:not([hidden])');
              if (select) await select.selectOption(String(next));
              else await p.fill('#nsDialog #nsDialogInput', String(next));
            }
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

  const signIn = async () => {
    await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
    await p.fill('#email', EMAIL);
    await p.fill('#password', PASSWORD);
    await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  };

  // The hero plus whichever tab is open -- a hidden tab's text is not on
  // screen, and innerText is right not to report it.
  const detailText = async () => (await p.locator('#bookingDetailView').innerText());

  // After a write the record is fetched and redrawn, and how long that takes
  // depends on how busy the database is. Waiting for the words to appear is
  // the only pause that is right on both a quiet machine and a loaded one.
  const detailSays = async (needle) => {
    await p.waitForFunction(
      (want) => (document.getElementById('bookingDetailView') || {}).innerText
        ?.toLowerCase().includes(String(want).toLowerCase()),
      needle, { timeout: 10000 },
    ).catch(() => {});
    return detailText();
  };
  const openTab = async (pane) => {
    await p.locator(`.rec-tab[data-pane="${pane}"]`).click();
    await p.waitForTimeout(250);
  };

  await signIn();
  ok('signed in');

  // A vehicle to book: 2,500/day, 200 km/day, 8 per extra km, 5,000 deposit.
  const reg = 'UI' + Date.now().toString().slice(-8);
  // Named per run, so this test always finds its own booking among whatever
  // else the other suites have left in the list.
  const customer = 'Ravi Kumar ' + Date.now().toString().slice(-6);
  await p.click('.admin-tab[data-tab="cars"]');
  await p.waitForTimeout(500);
  await p.click('#addCarBtn');
  await p.waitForTimeout(250);
  for (const [sel, val] of [['#carBrand', 'Maruti'], ['#carName', 'Swift — UI test'], ['#carRegNumber', reg],
                            ['#carSeats', '5'], ['#carYear', '2024'], ['#carPrice', '2500'],
                            ['#carKmLimit', '200'], ['#carExtraKmRate', '8'],
                            ['#carSecurityDeposit', '5000'], ['#carCurrentKm', '60000']]) {
    await p.fill(sel, val);
  }
  await p.click('#carForm button[type="submit"]');
  await p.waitForTimeout(1000);
  ok('vehicle created for the test');

  console.log('\n-- create a booking --');
  await p.click('.admin-tab[data-tab="bookings"]');
  await p.waitForTimeout(700);
  await p.click('#addBookingBtn');
  await p.waitForTimeout(300);
  await p.fill('#bkCustomerName', customer);
  await p.fill('#bkPhone', '9' + Date.now().toString().slice(-9));
  await p.fill('#bkLicence', 'TN0120230012345');
  await p.fill('#bkAddress', 'Nagercoil');
  await p.selectOption('#bkVehicle', { label: `Swift — UI test (${reg})` });
  await p.fill('#bkStartDate', '2026-11-01');
  await p.fill('#bkStartTime', '10:00');
  await p.fill('#bkReturnDate', '2026-11-04');
  await p.fill('#bkReturnTime', '10:00');
  await p.fill('#bkRentalAmount', '7500');
  await p.waitForTimeout(200);
  const duration = await p.locator('#bkDurationPreview').innerText();
  duration.includes('3') ? ok('duration preview shows 3 days') : bad('duration preview', duration);
  await p.click('#bookingForm button[type="submit"]');
  await p.waitForTimeout(1200);

  // Narrowed to this run's own booking before anything is read off the
  // table. The list shows one page of thirty, newest hire dates first, and
  // the other suites leave bookings dated well into 2027 -- enough to push
  // this one off the page entirely and fail a test of something else.
  //
  // Waited for rather than slept through: typing debounces and then fetches
  // the whole list again, which takes as long as the database is busy.
  const findBooking = async () => {
    await p.fill('#bookingSearch', customer);
    await p.waitForFunction(
      (name) => [...document.querySelectorAll('#bookingListWrap tbody tr')]
        .some((r) => r.innerText.includes(name)),
      customer, { timeout: 10000 },
    ).catch(() => {});
  };
  await findBooking();
  const listText = await p.locator('#bookingListWrap').innerText();
  has('booking appears in the list', listText, customer);
  has('booking number allocated', listText, 'NSC-');
  has('balance shows the full amount', listText, '₹7,500');

  console.log('\n-- double booking is refused in the form --');
  await p.click('#addBookingBtn');
  await p.waitForTimeout(300);
  await p.fill('#bkCustomerName', 'Someone Else');
  await p.fill('#bkPhone', '9000000009');
  await p.fill('#bkLicence', 'TN99');
  await p.selectOption('#bkVehicle', { label: `Swift — UI test (${reg})` });
  await p.fill('#bkStartDate', '2026-11-02');
  await p.fill('#bkStartTime', '10:00');
  await p.fill('#bkReturnDate', '2026-11-06');
  await p.fill('#bkReturnTime', '10:00');
  await p.fill('#bkRentalAmount', '9000');
  await p.click('#bookingForm button[type="submit"]');
  await p.waitForTimeout(1000);
  const conflict = await p.locator('#bookingConflictError').innerText();
  conflict.includes('already booked')
    ? ok('clash shown beside the dates, not in a dialog')
    : bad('clash shown beside the dates', conflict || '(empty)');
  await p.click('#bookingModalCancel');
  await p.waitForTimeout(300);

  console.log('\n-- open the booking --');
  await findBooking();
  await p.locator('#bookingListWrap tbody tr').filter({ hasText: customer }).first().click();
  await p.waitForTimeout(900);
  has('detail shows the customer', await detailText(), customer);
  has('detail shows Unpaid', await detailText(), 'Unpaid');

  console.log('\n-- deposit --');
  await openTab('deposit');
  await p.click('#detailAddDepositBtn');
  await p.waitForTimeout(300);
  const prefilled = await p.locator('#depositAmount').inputValue();
  prefilled === '5000' ? ok('deposit pre-filled from the booking terms') : bad('deposit pre-filled', prefilled);
  await p.click('#depositForm button[type="submit"]');
  await p.waitForTimeout(1000);
  let text = await detailText();
  has('deposit recorded as held', text, '₹5,000');
  has('total owed unchanged by the deposit', text, '₹7,500');

  console.log('\n-- payments --');
  await openTab('payments');
  await p.click('#detailAddPaymentBtn');
  await p.waitForTimeout(300);
  await p.selectOption('#paymentType', 'advance');
  await p.fill('#paymentAmount', '3000');
  await p.selectOption('#paymentMethod', 'UPI');
  await p.fill('#paymentReference', 'UPI-1234');
  await p.click('#paymentForm button[type="submit"]');
  await p.waitForTimeout(1000);
  text = await detailText();
  has('advance listed', text, 'Advance');
  has('balance falls to 4,500', text, '₹4,500');
  has('status is Partially Paid', text, 'Partially Paid');

  console.log('\n-- void a payment, keeping the record --');
  await openTab('payments');
  await p.click('#detailAddPaymentBtn');
  await p.waitForTimeout(300);
  await p.selectOption('#paymentType', 'additional');
  await p.fill('#paymentAmount', '200');
  await p.click('#paymentForm button[type="submit"]');
  await p.waitForTimeout(900);
  dialogAnswers = ['Entered against the wrong booking'];
  await p.locator('.void-payment').last().click();
  text = await detailSays('voided');
  has('voided payment still listed', text, 'voided');
  has('balance back to 4,500', text, '₹4,500');

  console.log('\n-- correct a payment that was entered too high --');
  dialogAnswers = [{ amount: '2500', reason: 'Counted 3000, took 2500' }];
  await p.locator('.edit-payment').first().click();
  text = await detailSays('correction');
  has('the correction is listed', text, 'correction');
  has('taken off as a negative row', text, '\u2212\u202f₹500');
  has('received falls to 2,500', text, '₹2,500');
  has('and the original 3,000 is still there', text, '₹3,000');

  console.log('\n-- correct the deposit --');
  await openTab('deposit');
  dialogAnswers = [{ amount: '4500', reason: 'Took 4500, wrote 5000' }];
  await p.locator('.edit-deposit').first().click();
  text = await detailSays('₹4,500');
  has('the corrected deposit is held', text, '₹4,500');
  // One row, not two: the superseded figure is kept by the server and left
  // off the screen, because what is still held is one sum of money.
  const depositRowCount = await p.locator('.edit-deposit').count();
  depositRowCount === 1 ? ok('still one deposit row')
                        : bad('still one deposit row', `${depositRowCount} rows`);
  // Put it back, so the refund below is testing the refund.
  dialogAnswers = [{ amount: '5000', reason: 'The 5000 was right' }];
  await p.locator('.edit-deposit').first().click();
  has('and a correction can itself be corrected', await detailSays('₹5,000'), '₹5,000');

  console.log('\n-- pickup --');
  await openTab('handover');
  await p.click('#detailPickupBtn');
  await p.waitForTimeout(300);
  const startKm = await p.locator('#pickupStartKm').inputValue();
  startKm === '60000' ? ok('starting KM pre-filled from the vehicle') : bad('starting KM pre-filled', startKm);
  await p.selectOption('#pickupFuelLevel', 'Full');
  await p.fill('#pickupCondition', 'Clean, no damage');
  await p.click('#pickupForm button[type="submit"]');
  await p.waitForTimeout(1100);
  text = await detailText();
  has('pickup recorded', text, '60,000');
  has('booking is now Active', await p.locator('.rec-hero').innerText(), 'Active');

  console.log('\n-- return, with extra km --');
  await openTab('handover');
  await p.click('#detailReturnBtn');
  await p.waitForTimeout(300);
  await p.fill('#returnEndKm', '60850');
  await p.waitForTimeout(300);
  const preview = await p.locator('#returnKmPreview').innerText();
  preview.includes('850') && preview.includes('250')
    ? ok('return preview computes 850 driven, 250 over')
    : bad('return preview', preview);
  await p.selectOption('#returnFuelLevel', '1/2');
  await p.click('#returnForm button[type="submit"]');
  await p.waitForTimeout(1200);
  text = await detailText();
  has('850 km total', text, '850');
  has('250 km extra', text, '250');
  has('extra charge of 2,000', text, '₹2,000');
  has('total rises to 9,500', text, '₹9,500');

  console.log('\n-- correct a misread meter, and the fuel with it --');
  await openTab('handover');
  dialogAnswers = [{ odometer_km: '60800', fuel_level: '1/4',
                     condition_note: 'Mud on the sills',
                     reason: 'Misread the meter' }, true];
  await p.locator('.edit-km').last().click();
  text = await detailSays('Mud on the sills');
  has('800 km after correction', text, '800');
  has('extra charge falls to 1,600', text, '₹1,600');
  has('the fuel level went with it', text, '1/4');
  has('and so did the condition', text, 'Mud on the sills');

  console.log('\n-- refund the deposit --');
  await openTab('deposit');
  await p.click('#detailRefundBtn');
  await p.waitForTimeout(300);
  await p.fill('#refundDeduction', '750');
  await p.fill('#refundReason', 'Scratch on rear bumper');
  await p.waitForTimeout(200);
  const refundPreview = await p.locator('#refundAmountPreview').innerText();
  refundPreview.includes('4,250') ? ok('refund preview shows 4,250') : bad('refund preview', refundPreview);
  dialogAnswers = [true];
  await p.click('#refundForm button[type="submit"]');
  await p.waitForTimeout(1300);
  text = await detailText();
  has('deduction recorded', text, '₹750');
  has('refund recorded', text, '₹4,250');

  console.log('\n-- complete --');
  dialogAnswers = [true, true];
  await p.click('#detailCompleteBtn');
  await p.waitForTimeout(1300);
  has('booking is Completed', await p.locator('.rec-hero').innerText(), 'Completed');

  console.log('\n-- the tabs --');
  for (const [pane, needle] of [['overview', 'Agreed terms'], ['payments', 'Payments'],
                                ['deposit', 'Security Deposit'], ['handover', 'Vehicle Return'],
                                ['documents', 'Customer Documents'], ['timeline', 'Timeline']]) {
    await openTab(pane);
    has(`the ${pane} tab shows its section`, await detailText(), needle);
  }
  await openTab('overview');

  await p.screenshot({ path: `${SHOT_DIR}/booking_detail.png`, fullPage: false });

  console.log('\n-- it all persisted --');
  await p.reload({ waitUntil: 'networkidle' });
  await p.click('.admin-tab[data-tab="bookings"]');
  await p.waitForTimeout(900);
  const counts = await p.locator('#bookingStats').innerText();
  has('the counts are shown above the list', counts, 'Total');
  // The reload clears the search box, and page one of the list is whatever
  // has the latest hire dates. Ask for this booking by name again.
  await findBooking();
  const afterReload = await p.locator('#bookingListWrap').innerText();
  has('booking survives a reload', afterReload, customer);
  has('still shows as Completed', afterReload, 'Completed');

  console.log('\n-- other tabs still render --');
  for (const tab of ['dashboard', 'cars', 'inquiries', 'finance', 'reports']) {
    await p.click(`.admin-tab[data-tab="${tab}"]`);
    await p.waitForTimeout(600);
    const visible = await p.locator(`#panel-${tab}`).isVisible();
    visible ? ok(`${tab} tab renders`) : bad(`${tab} tab renders`);
  }

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
