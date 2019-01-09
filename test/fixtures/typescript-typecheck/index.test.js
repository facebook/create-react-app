const testSetup = require('../__shared__/test-setup');
const puppeteer = require('puppeteer');

const expectedErrorMsg = `Argument of type '123' is not assignable to parameter of type 'string'`;

test('shows error overlay in browser', async () => {
  const { port, done } = await testSetup.scripts.start();

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}/`);
    await page.waitForSelector('iframe', { timeout: 5000 });
    const overlayMsg = await page.evaluate(() => {
      const overlay = document.querySelector('iframe').contentWindow;
      return overlay.document.body.innerHTML;
    });
    expect(overlayMsg).toContain(expectedErrorMsg);
  } finally {
    browser.close();
    done();
  }
});

test('shows error in console (dev mode)', async () => {
  const { stderr } = await testSetup.scripts.start({ smoke: true });
  expect(stderr).toContain(expectedErrorMsg);
});

test('shows error in console (prod mode)', async () => {
  const { stderr } = await testSetup.scripts.build();
  expect(stderr).toContain(expectedErrorMsg);
});
