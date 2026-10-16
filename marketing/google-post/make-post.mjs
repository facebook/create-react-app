/**
 * Renders post.html to the two sizes a Google Business post needs.
 *
 * Run from the repository root:
 *
 *   node marketing/google-post/make-post.mjs
 *
 * 1200x900 is what Google asks for on a profile post; 1080x1080 is the same
 * card squared off, for WhatsApp status and Instagram, so one edit to the
 * wording changes both.
 *
 * deviceScaleFactor stays at 1 on purpose: Google resizes anything larger and
 * a 2400px file is only a slower upload on a phone connection.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Playwright is not a dependency of this site -- it is installed once on the
// machine that renders the poster. Taken from wherever it is, rather than
// from one particular path, so the suite is not tied to one person's laptop.
const require = createRequire(import.meta.url);
const { chromium } = (() => {
  for (const at of [process.env.PLAYWRIGHT_PATH, 'playwright', '/opt/node22/lib/node_modules/playwright']) {
    try {
      if (at) return require(at);
    } catch {
      // Try the next one.
    }
  }
  throw new Error('Playwright not found. npm i -g playwright, or set PLAYWRIGHT_PATH.');
})();

const here = dirname(fileURLToPath(import.meta.url));

const SIZES = [
  { shape: 'post', width: 1200, height: 900, file: 'nitesha-google-post-1200x900.jpg' },
  { shape: 'square', width: 1080, height: 1080, file: 'nitesha-google-post-1080x1080.jpg' },
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

for (const size of SIZES) {
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${join(here, 'post.html')}`);
  await page.evaluate((shape) => {
    document.body.dataset.shape = shape;
  }, size.shape);

  // The webfonts and the photograph are both file:// fetches; without this the
  // first screenshot catches the fallback face.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');

  // JPEG, not PNG. Most of this card is a photograph, which PNG stores
  // losslessly at about a megabyte; at quality 92 the same picture is a fifth
  // of that with nothing visible to tell them apart, and the difference is
  // the whole wait when the post is uploaded from a phone.
  await page.screenshot({ path: join(here, size.file), type: 'jpeg', quality: 92 });
  console.log(`${size.file}  ${size.width}x${size.height}`);
  await page.close();
}

await browser.close();
