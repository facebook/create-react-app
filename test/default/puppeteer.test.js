const puppeteer = require('puppeteer');

describe('verify puppeteer config', () => {
  let browser = null;

  afterEach(() => {
    if (browser != null) {
      browser.close();
      browser = null;
    }
  });

  it('should start up', async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    page.setContent(`
      <html>
        <body class="hello">Hello</body>
      </html>
    `);
    const element = await page.waitForSelector('.hello', { timeout: 0 });
    const text = await page.evaluate(el => el.innerText, element);
    expect(text).toBe('Hello');
  });
});
