/**
 * The two record screens: the list, and one record opened from it.
 *
 * Bookings and Inquiries share their shape -- counts above filters above a
 * sortable table, and a record that opens in place of the list with its
 * sections behind tabs -- so they are checked together, against the same
 * behaviour.
 *
 *   node tools/test-records-ui.js http://127.0.0.1:8210 admin@example.com password
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
  ? ok(l) : bad(l, `"${needle}" not in view`));

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 1500, height: 1100 } })).newPage();

  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => {
    const t = m.text();
    if (m.type() === 'error' && !t.includes('favicon') && !t.includes('ERR_CONNECTION_RESET')
        && !t.includes('ERR_CERT_AUTHORITY_INVALID')) errs.push('console: ' + t);
  });
  // Nothing here should reach a browser dialog any more -- this suite drives
  // the panel's own, by its buttons. One arriving is a finding, not noise.
  p.on('dialog', async (d) => { errs.push('a browser dialog: ' + d.message()); await d.dismiss(); });

  await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
  await p.fill('#email', EMAIL);
  await p.fill('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  await p.waitForTimeout(900);
  ok('signed in');

  const stamp = Date.now().toString().slice(-6);

  // Enough bookings that the table has a second page to turn to. Made through
  // the API rather than the form: this is a test of the list, not of typing.
  console.log('\n-- something to list --');
  const made = await p.evaluate(async ({ stamp }) => {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    const send = (url, body) => fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify(body),
    });

    // A car of this run's own. Taking whichever vehicle happened to be first
    // meant every run booked the same twelve dates against the same car, so
    // the second run clashed with the first and eleven of its twelve
    // bookings came back 409.
    const car = await (await send('api/vehicles.php?action=save', {
      name: `List Test Car ${stamp}`, brand: 'Maruti', reg_number: `LS${stamp}`,
      body_type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5,
      model_year: 2024, colour: '#334455', status: 'Available', current_km: 10000,
      rate_daily: '1500', km_limit_per_day: 200, extra_km_rate: '5',
      security_deposit: '3000',
    })).json();
    const id = car.vehicle && car.vehicle.id;
    if (!id) return 0;
    let count = 0;
    for (let i = 0; i < 12; i++) {
      const day = String(3 + i * 2).padStart(2, '0');
      const r = await send('api/bookings.php?action=save', {
        // The phone is how a customer is recognised, so it has to carry
        // this run's stamp as well. With a fixed number, every run matched
        // the customer the first run created and the list went on showing
        // that run's name -- which is why searching for this run's stamp
        // found nothing at all.
        customer_name: `List Test ${stamp}-${i}`,
        phone: '9' + stamp + String(i).padStart(3, '0'),
        licence_number: 'TN75LIST' + i, vehicle_id: id,
        start_at: `2027-03-${day}T10:00`, return_at: `2027-03-${day}T18:00`,
        base_rental: String(1000 + i * 100), km_limit_per_day: '200', extra_km_rate: '5',
      });
      if (r.ok) count++;
    }
    return count;
  }, { stamp });
  is('twelve bookings to work with', made, 12);

  await p.click('.admin-tab[data-tab="bookings"]');
  await p.waitForTimeout(1200);

  console.log('\n-- the counts above the list --');
  const stats = await p.locator('#bookingStats').innerText();
  has('a total', stats, 'Total');
  has('what is coming', stats, 'Upcoming');
  has('what is owed', stats, 'Payment due');
  const statTotal = Number((await p.locator('#bookingStats .rec-stat-n').first().innerText()).trim());
  const rowsAll = await p.locator('#bookingListWrap tbody tr').count();
  const pagerTotal = Number((await p.locator('#bookingPager').innerText()).match(/Total (\d+)/)[1]);
  is('the total counts every booking, not the page', statTotal, pagerTotal);
  (rowsAll <= 30) ? ok('the page holds at most a page', `${rowsAll} rows`) : bad('page size', rowsAll);

  console.log('\n-- the chips filter, and say how many --');
  const chipText = await p.locator('#bookingChips [data-chip="Confirmed"]').innerText();
  await p.click('#bookingChips [data-chip="Confirmed"]');
  await p.waitForTimeout(500);
  const confirmedRows = await p.locator('#bookingListWrap tbody tr').count();
  const chipCount = Number(chipText.match(/(\d+)\s*$/)[1]);
  is('the chip count matches the rows it shows', Math.min(confirmedRows, 30), Math.min(chipCount, 30));
  const statuses = await p.locator('#bookingListWrap tbody tr .status-badge').allInnerTexts();
  // Uppercased by the stylesheet, so compare on the lowercase of it.
  statuses.every(t => /confirmed|upcoming|today|starts/.test(t.toLowerCase()))
    ? ok('and nothing else is left in the table')
    : bad('and nothing else is left', statuses.join(','));
  await p.click('#bookingChips [data-chip="all"]');
  await p.waitForTimeout(500);

  console.log('\n-- search --');
  // Waited for rather than slept through. Typing debounces for a quarter of
  // a second and then fetches the whole list again, which on a database
  // several suites have been writing to takes longer than any fixed pause
  // worth writing down.
  await p.fill('#bookingSearch', `List Test ${stamp}-7`);
  await p.waitForFunction(
    () => document.querySelectorAll('#bookingListWrap tbody tr').length === 1,
    null, { timeout: 10000 },
  ).catch(() => {});
  is('search narrows to the one', await p.locator('#bookingListWrap tbody tr').count(), 1);
  await p.click('#bookingReset');
  await p.waitForTimeout(600);
  (await p.locator('#bookingListWrap tbody tr').count()) > 1
    ? ok('and the reset puts them all back') : bad('reset puts them back');
  is('the search box is emptied too', await p.locator('#bookingSearch').inputValue(), '');

  console.log('\n-- sorting --');
  const firstBy = async () => (await p.locator('#bookingListWrap tbody tr .rec-id').first().innerText()).trim();
  await p.click('#bookingListWrap th[data-sort="booking_number"]');
  await p.waitForTimeout(400);
  const ascFirst = await firstBy();
  await p.click('#bookingListWrap th[data-sort="booking_number"]');
  await p.waitForTimeout(400);
  const descFirst = await firstBy();
  ascFirst !== descFirst && ascFirst < descFirst
    ? ok('clicking a column sorts it, and again turns it round', `${ascFirst} / ${descFirst}`)
    : bad('sorting turns round', `${ascFirst} then ${descFirst}`);

  console.log('\n-- paging --');
  await p.selectOption('#bookingPager [data-per-page]', '10');
  await p.waitForTimeout(500);
  is('ten to a page', await p.locator('#bookingListWrap tbody tr').count(), 10);
  has('and it says which page', await p.locator('#bookingPager').innerText(), 'Page 1 of');
  const firstOnPageOne = await firstBy();
  await p.click('#bookingPager [data-page="next"]');
  await p.waitForTimeout(500);
  (await firstBy()) !== firstOnPageOne ? ok('Next turns the page') : bad('Next turns the page');
  has('and says so', await p.locator('#bookingPager').innerText(), 'Page 2 of');
  await p.click('#bookingPager [data-page="prev"]');
  await p.waitForTimeout(500);
  is('Back comes home', await firstBy(), firstOnPageOne);
  is('the row numbers start again at 1',
    (await p.locator('#bookingListWrap tbody tr .rec-sno').first().innerText()).trim(), '1');

  console.log('\n-- opening one --');
  await p.locator('#bookingListWrap tbody tr').first().click();
  await p.waitForTimeout(1200);
  (await p.locator('#bookingListView').isVisible()) === false
    ? ok('the list gives way to the record') : bad('the list gives way');
  const hero = await p.locator('#bookingDetailView .rec-hero').innerText();
  has('the record leads with its number', hero, 'NSC-');
  has('and what is owed', hero, 'Balance');
  for (const pane of ['payments', 'deposit', 'handover', 'documents', 'timeline']) {
    await p.locator(`.rec-tab[data-pane="${pane}"]`).click();
    await p.waitForTimeout(200);
    (await p.locator(`.rec-pane[data-pane="${pane}"]`).isVisible())
      ? ok(`the ${pane} tab opens`) : bad(`the ${pane} tab opens`);
  }
  await p.click('#bookingDetailBack');
  await p.waitForTimeout(800);
  (await p.locator('#bookingListView').isVisible())
    ? ok('and Back returns to the list') : bad('Back returns to the list');

  console.log('\n-- the action buttons --');
  await p.locator('#bookingListWrap tbody tr [data-act="edit"]').first().click();
  await p.waitForTimeout(600);
  (await p.locator('#bookingModalOverlay').isVisible())
    ? ok('the pencil opens the booking for editing') : bad('the pencil opens the form');
  await p.click('#bookingModalCancel');
  await p.waitForTimeout(400);
  await p.locator('#bookingListWrap tbody tr [data-act="open"]').first().click();
  await p.waitForTimeout(1000);
  (await p.locator('#bookingDetailView .rec-hero').isVisible())
    ? ok('and the eye opens the record') : bad('the eye opens the record');
  await p.click('#bookingDetailBack');
  await p.waitForTimeout(700);

  console.log('\n-- the same shape on inquiries --');
  await p.click('.admin-tab[data-tab="inquiries"]');
  await p.waitForTimeout(1200);
  has('counts above the list', await p.locator('#enquiryStats').innerText(), 'Total');
  (await p.locator('#enquiryChips .rec-chip').count()) >= 6
    ? ok('a chip for every status') : bad('a chip for every status');
  const unreadBefore = await p.locator('#inquiriesWrap tbody tr.rec-unread').count();
  if (unreadBefore === 0) {
    ok('nothing unread to open', '(skipped)');
  } else {
    await p.locator('#inquiriesWrap tbody tr.rec-unread').first().click();
    await p.waitForTimeout(1200);
    has('the inquiry opens on its own page', await p.locator('#enquiryDetailView .rec-hero').innerText(), 'ENQ-');
    await p.click('#enquiryDetailBack');
    await p.waitForTimeout(900);
    (await p.locator('#inquiriesWrap tbody tr.rec-unread').count()) < unreadBefore
      ? ok('and opening it clears the unread mark') : bad('opening clears the unread mark');
  }

  console.log('\n-- deleting, and being asked first --');
  await p.click('.admin-tab[data-tab="bookings"]');
  await p.waitForTimeout(1100);
  const rowsBefore = Number((await p.locator('#bookingPager').innerText()).match(/Total (\d+)/)[1]);
  const doomed = (await p.locator('#bookingListWrap tbody tr .rec-id').first().innerText()).trim();

  await p.locator('#bookingListWrap tbody tr [data-act="delete"]').first().click();
  await p.waitForTimeout(400);
  (await p.locator('#nsDialog').isVisible())
    ? ok('the bin asks before it does anything') : bad('the bin asks first');
  const dialog = await p.locator('#nsDialog .modal').innerText();
  has('it names the booking', dialog, doomed);
  has('and says the money stops being counted', dialog, 'stops being counted');
  has('and that it cannot be undone', dialog, 'cannot be undone');

  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  (await p.locator('#nsDialog').isVisible())
    ? bad('Escape closes it') : ok('Escape closes it');
  is('and nothing was deleted',
    Number((await p.locator('#bookingPager').innerText()).match(/Total (\d+)/)[1]), rowsBefore);

  await p.locator('#bookingListWrap tbody tr [data-act="delete"]').first().click();
  await p.waitForTimeout(400);
  await p.click('#nsDialog [data-ns="cancel"]');
  await p.waitForTimeout(600);
  is('Cancel leaves it alone',
    Number((await p.locator('#bookingPager').innerText()).match(/Total (\d+)/)[1]), rowsBefore);

  // Waited for, not slept through: deleting re-fetches the list, and how
  // long that takes depends on how much the other suites have left in it.
  const waitForTotal = (pager, want) => p.waitForFunction(
    ([sel, n]) => {
      const m = (document.querySelector(sel) || {}).innerText || '';
      const found = m.match(/Total (\d+)/);
      return !!found && Number(found[1]) === n;
    },
    [pager, want], { timeout: 10000 },
  ).catch(() => {});

  await p.locator('#bookingListWrap tbody tr [data-act="delete"]').first().click();
  await p.waitForTimeout(400);
  await p.click('#nsDialog [data-ns="go"]');
  await waitForTotal('#bookingPager', rowsBefore - 1);
  is('confirming removes it',
    Number((await p.locator('#bookingPager').innerText()).match(/Total (\d+)/)[1]), rowsBefore - 1);
  ((await p.locator('#bookingListWrap').innerText()).includes(doomed))
    ? bad('and it is gone from the table', doomed + ' still listed')
    : ok('and it is gone from the table', doomed);
  is('the count above the table agrees',
    Number((await p.locator('#bookingStats .rec-stat-n').first().innerText()).trim()), rowsBefore - 1);

  await p.click('.admin-tab[data-tab="inquiries"]');
  await p.waitForTimeout(1100);
  const inqBefore = Number((await p.locator('#enquiryPager').innerText()).match(/Total (\d+)/)[1]);
  // Not whichever is first. An enquiry that became a booking cannot be
  // deleted -- the booking points at it -- and after the enquiry suite has
  // run, the newest enquiry in the list is exactly that one.
  await p.locator('#inquiriesWrap tbody tr')
    .filter({ hasNotText: 'CONVERTED' })
    .first()
    .locator('[data-act="delete"]')
    .click();
  await p.waitForTimeout(400);
  has('an inquiry asks the same way', await p.locator('#nsDialog .modal').innerText(), 'ENQ-');
  await p.click('#nsDialog [data-ns="go"]');
  await waitForTotal('#enquiryPager', inqBefore - 1);
  is('and goes when confirmed',
    Number((await p.locator('#enquiryPager').innerText()).match(/Total (\d+)/)[1]), inqBefore - 1);

  console.log('\nJS errors: ' + (errs.length ? errs.join(' | ') : 'NONE'));
  if (errs.length) fail++;
  console.log(`\n${pass} passed, ${fail} failed`);
  await br.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
