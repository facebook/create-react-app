const {
  bootstrap,
  startDevelopmentServer,
  startProductionServer,
} = require('../../utils');
const puppeteer = require('puppeteer');

beforeEach(async () => {
  await bootstrap({ directory: global.testDirectory, template: __dirname });
  global.appDevPort = await startDevelopmentServer({
    directory: global.testDirectory,
  });
  global.appProdPort = await startProductionServer({
    directory: global.testDirectory,
  });
  // Wait for serve to boot up
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// https://github.com/facebook/create-react-app/issues/5234
// https://github.com/facebook/create-react-app/pull/5258
describe('graphql with mjs entrypoint', () => {
  it('correctly bundles files in development', async () => {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${global.appDevPort}/`);
      await page.waitForSelector('.Pokemon-Name-Data');
      const output = await page.evaluate(() => {
        return Array.from(
          document.getElementsByClassName('Pokemon-Name-Data')
        ).pop().innerHTML;
      });
      expect(output).toMatchSnapshot();
    } finally {
      browser.close();
    }
  });

  it('correctly bundles files in production', async () => {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${global.appProdPort}/`);
      await page.waitForSelector('.Pokemon-Name-Data');
      const output = await page.evaluate(() => {
        return Array.from(
          document.getElementsByClassName('Pokemon-Name-Data')
        ).pop().innerHTML;
      });
      expect(output).toMatchSnapshot();
    } finally {
      browser.close();
    }
  });
});
