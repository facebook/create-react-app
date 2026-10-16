/**
 * Drives the Finance tab: record an expense, correct it, void one, and check
 * the figures on screen follow — including that income is the payments
 * already taken rather than anything typed in here.
 *
 *   node tools/test-finance-ui.js http://127.0.0.1:8210 admin@example.com password
 */

const { chromium } = require('/opt/node22/lib/node_modules/playwright');

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
const rupees = (text) => Number(String(text).replace(/[^0-9.-]/g, '')) || 0;

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await br.newContext({ viewport: { width: 1400, height: 1200 } })).newPage();

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

  const stamp = Date.now().toString().slice(-6);
  const expenseText = `Diesel run ${stamp}`;

  await p.goto(`${BASE}/index.php`, { waitUntil: 'networkidle' });
  await p.fill('#email', EMAIL);
  await p.fill('#password', PASSWORD);
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle' }), p.click('button[type="submit"]')]);
  ok('signed in');

  await p.click('.admin-tab[data-tab="finance"]');
  await p.waitForTimeout(1400);

  console.log('\n-- the tab loads from the server --');
  const incomeBefore = rupees(await p.locator('#financeIncome').innerText());
  const spentBefore = rupees(await p.locator('#financeExpense').innerText());
  incomeBefore > 0
    ? ok(`income comes from recorded payments (₹${incomeBefore.toLocaleString('en-IN')})`)
    : bad('income comes from recorded payments', 'showing zero');
  (await p.locator('#financeByMethod').innerText()).trim().length > 0
    ? ok('income is broken down by how it was paid') : bad('income by method');

  console.log('\n-- there is no way to type in income --');
  (await p.locator('#txnType').count()) === 0
    ? ok('the old income/expense entry form is gone')
    : bad('the old form is gone', 'a type selector is still on the page');

  console.log('\n-- record an expense --');
  await p.click('#addExpenseBtn');
  await p.waitForTimeout(300);
  await p.fill('#expAmount', '2500');
  await p.selectOption('#expCategory', 'Fuel');
  await p.selectOption('#expMethod', 'UPI');
  await p.fill('#expVendor', 'Indian Oil');
  await p.fill('#expDescription', expenseText);
  await p.click('#expenseForm button[type="submit"]');
  await p.waitForTimeout(1400);

  let listed = await p.locator('#expensesWrap').innerText();
  has('the expense is listed', listed, expenseText);
  has('with its number', listed, 'EXP-');
  has('and where the money went', listed, 'Indian Oil');
  has('marked as awaiting approval', listed, 'awaiting approval');

  let spent = rupees(await p.locator('#financeExpense').innerText());
  spent === spentBefore + 2500
    ? ok('the expense total rises by 2,500')
    : bad('expense total', `${spentBefore} -> ${spent}`);
  rupees(await p.locator('#financeIncome').innerText()) === incomeBefore
    ? ok('recording an expense leaves income alone')
    : bad('income unchanged by an expense');

  console.log('\n-- a bad entry is refused where you can see it --');
  await p.click('#addExpenseBtn');
  await p.waitForTimeout(300);
  await p.fill('#expAmount', '500');
  await p.fill('#expDate', '2099-01-01');
  await p.click('#expenseForm button[type="submit"]');
  await p.waitForTimeout(900);
  has('a future date is refused beside the form',
      await p.locator('#expenseFormError').innerText(), 'future');
  (await p.locator('#expenseModalOverlay').isVisible())
    ? ok('the form stays open so it can be fixed')
    : bad('the form stays open');
  await p.click('#expenseModalCancel');
  await p.waitForTimeout(300);

  console.log('\n-- correct it: the original stays --');
  dialogAnswers = ['300', 'Bill was 2800, not 2500'];
  await p.locator('#expensesWrap .expense-card').filter({ hasText: expenseText }).first()
    .locator('.correct-expense').click();
  await p.waitForTimeout(1400);
  listed = await p.locator('#expensesWrap').innerText();
  has('the original figure is still shown', listed, '₹2,500');
  has('and the adjustment sits beside it', listed, '₹300');
  has('saying what it corrects', listed, 'Corrects EXP-');
  spent = rupees(await p.locator('#financeExpense').innerText());
  spent === spentBefore + 2800
    ? ok('the total follows the correction to 2,800')
    : bad('total after correction', `expected ${spentBefore + 2800}, got ${spent}`);

  console.log('\n-- approve it --');
  dialogAnswers = [true];
  await p.locator('#expensesWrap .expense-card').filter({ hasText: expenseText }).first()
    .locator('.approve-expense').click();
  await p.waitForTimeout(1300);
  const approved = await p.locator('#expensesWrap .expense-card').filter({ hasText: expenseText }).first().innerText();
  approved.toLowerCase().includes('awaiting approval')
    ? bad('the approval badge clears once approved')
    : ok('the approval badge clears once approved');

  await p.screenshot({ path: `${SHOT_DIR}/finance_tab.png`, fullPage: true });

  console.log('\n-- void one --');
  await p.click('#addExpenseBtn');
  await p.waitForTimeout(300);
  await p.fill('#expAmount', '900');
  await p.selectOption('#expCategory', 'Repairs');
  await p.fill('#expDescription', `Mistake ${stamp}`);
  await p.click('#expenseForm button[type="submit"]');
  await p.waitForTimeout(1300);
  const withMistake = rupees(await p.locator('#financeExpense').innerText());
  withMistake === spentBefore + 3700 ? ok('it counts while it stands') : bad('counted', String(withMistake));

  dialogAnswers = ['Recorded twice'];
  await p.locator('#expensesWrap .expense-card').filter({ hasText: `Mistake ${stamp}` }).first()
    .locator('.void-expense').click();
  await p.waitForTimeout(1400);
  spent = rupees(await p.locator('#financeExpense').innerText());
  spent === spentBefore + 2800
    ? ok('voiding takes it back out of the total')
    : bad('total after voiding', `expected ${spentBefore + 2800}, got ${spent}`);
  (await p.locator('#expensesWrap').innerText()).includes(`Mistake ${stamp}`)
    ? bad('a voided expense leaves the list')
    : ok('a voided expense leaves the list');

  await p.check('#finShowVoided');
  await p.waitForTimeout(1200);
  listed = await p.locator('#expensesWrap').innerText();
  has('but is still on file when asked for', listed, `Mistake ${stamp}`);
  has('with the reason', listed, 'Recorded twice');
  await p.uncheck('#finShowVoided');
  await p.waitForTimeout(1000);

  console.log('\n-- the period can be changed --');
  await p.click('#finThisYear');
  await p.waitForTimeout(1300);
  rupees(await p.locator('#financeExpense').innerText()) >= spent
    ? ok('a wider period never shows less')
    : bad('this year >= this month');
  await p.click('#finLastMonth');
  await p.waitForTimeout(1300);
  ok('last month loads without error');
  await p.click('#finThisMonth');
  await p.waitForTimeout(1300);

  console.log('\n-- it survives a reload --');
  await p.reload({ waitUntil: 'networkidle' });
  await p.click('.admin-tab[data-tab="finance"]');
  await p.waitForTimeout(1400);
  has('the expense is still there', await p.locator('#expensesWrap').innerText(), expenseText);

  console.log('\n-- the dashboard agrees --');
  await p.click('.admin-tab[data-tab="dashboard"]');
  await p.waitForTimeout(1300);
  rupees(await p.locator('#statExpense').innerText()) === spentBefore + 2800
    ? ok('the dashboard shows the same expense figure')
    : bad('dashboard expense figure', await p.locator('#statExpense').innerText());

  console.log('\n-- reports still compute --');
  await p.click('.admin-tab[data-tab="reports"]');
  await p.waitForTimeout(800);
  await p.click('.report-tab[data-report="revenue"]');
  await p.waitForTimeout(1300);
  has('the revenue report includes expenses',
      await p.locator('#reportResults').innerText(), 'Expenses');

  console.log('\n-- other tabs still render --');
  for (const tab of ['bookings', 'cars', 'inquiries']) {
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
