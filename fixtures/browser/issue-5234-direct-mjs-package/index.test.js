const { bootstrap, startDevelopmentServer } = require('../../utils');
const puppeteer = require('puppeteer');

beforeEach(async () => {
  await bootstrap({ directory: global.testDirectory, template: __dirname });
  global.appPort = await startDevelopmentServer({
    directory: global.testDirectory,
  });
  await new Promise(resolve => setTimeout(resolve, 3000));
});

// https://github.com/facebook/create-react-app/issues/5234
describe('issue #5234 (mjs files are imported as static files)', () => {
  it('correctly bundles files in development', async () => {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      console.log(`http://localhost:${global.appPort}/`);
      await page.goto(`http://localhost:${global.appPort}/`);
      await page.waitForSelector('.App-Ready');
      const output = await page.evaluate(() => {
        return document.testData;
      });
      expect(output).toMatchSnapshot();
    } finally {
      browser.close();
    }
  });
});
