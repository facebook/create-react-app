/**
 * What the built HTML actually carries, checked without running a browser.
 *
 *   npm run seo
 *
 * Every rule here is one that was broken at some point and cost something:
 * /cars was served to Google as "Loading our cars…", the two pages the
 * business is searched for by name had no cars and no rates in them, and
 * twelve town pages nearly became twelve copies of each other. A number in a
 * report nobody runs does not stop any of that happening again, so this exits
 * non-zero and the numbers are thresholds rather than observations.
 *
 * It reads the files on disk. That is the point: what a crawler is served is
 * the file, and anything that only appears once JavaScript has run is
 * precisely what this exists to catch.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist');

if (!existsSync(join(dist, 'sitemap.xml'))) {
  console.error('seo-audit: no build to check. Run npm run build first.');
  process.exit(1);
}

const routes = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
  .match(/<loc>([^<]*)<\/loc>/g)
  .map((l) => l.replace(/<\/?loc>/g, '').replace(/^https?:\/\/[^/]+/, '') || '/');

/** Google trims a result at about these, and the part it trims is the end. */
const TITLE_MAX = 62;
const DESC_MAX = 160;
const DESC_MIN = 70;

/** Below this a page is not saying enough to rank for anything. */
const WORDS_MIN = 250;

/** Two pages of the same family sharing more than this are becoming one page. */
const OVERLAP_MAX = 0.45;

/**
 * A term past this share of a page reads as stuffing rather than as prose.
 *
 * Eight rather than six, because the page's own subject is allowed to be the
 * word it says most: a page about hiring a car in Nagercoil will say Nagercoil
 * in its title, its heading, its breadcrumb and its prose, and that is the
 * page being about something rather than being written for a crawler. Six
 * flagged exactly that and nothing else, and the fix for it -- taking the town
 * out of the headings -- made the twelve town pages measurably more alike,
 * which is the failure this file exists to prevent.
 */
const DENSITY_MAX = 0.08;

const problems = [];
const note = (route, message) => problems.push(`${route}: ${message}`);

const pages = new Map();

for (const route of routes) {
  const file =
    route === '/'
      ? join(dist, 'index.html')
      : join(dist, route.replace(/^\//, ''), 'index.html');

  if (!existsSync(file)) {
    note(route, 'in the sitemap with no page behind it');
    continue;
  }

  const html = readFileSync(file, 'utf8');

  // <main> rather than the whole body: the header and footer are on every
  // page, and counting them would make a thin page look full and two
  // different pages look alike.
  const from = html.indexOf('<main');
  const to = html.lastIndexOf('</main>');
  const main = from >= 0 && to > from ? html.slice(from, to) : '';

  const text = main
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const one = (re) => (html.match(re) || [])[1];

  const page = {
    title: one(/<title>([^<]*)<\/title>/) ?? '',
    description: one(/<meta\s+name="description"\s+content="([^"]*)"/s) ?? '',
    canonical: one(/<link rel="canonical" href="([^"]*)"/),
    h1: (main.match(/<h1\b/g) || []).length,
    words: text.split(' ').filter(Boolean),
    images: [...main.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]),
    ld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .flatMap((m) => {
        try {
          const parsed = JSON.parse(m[1]);
          return (Array.isArray(parsed) ? parsed : [parsed]).map((x) => x['@type']);
        } catch {
          note(route, 'has structured data that is not valid JSON');
          return [];
        }
      }),
  };

  pages.set(route, page);

  if (page.title === '') note(route, 'has no title');
  else if (page.title.length > TITLE_MAX)
    note(route, `title is ${page.title.length} characters, cut at ${TITLE_MAX}`);

  if (page.description === '') note(route, 'has no meta description');
  else if (page.description.length > DESC_MAX)
    note(route, `description is ${page.description.length} characters, cut at ${DESC_MAX}`);
  else if (page.description.length < DESC_MIN)
    note(route, `description is only ${page.description.length} characters`);

  if (!page.canonical) note(route, 'has no canonical URL');

  if (page.h1 !== 1) note(route, `has ${page.h1} h1 headings, not 1`);

  if (page.words.length < WORDS_MIN)
    note(route, `is ${page.words.length} words — too thin to rank for anything`);

  // The one that started all this: content that is only there once the
  // JavaScript has run is content a crawler is not served.
  if (/Loading|Fetching|Please wait/i.test(text.slice(0, 2000)))
    note(route, 'is served with a loading message in it');

  const noAlt = page.images.filter((img) => !/\balt=/.test(img));
  if (noAlt.length > 0) note(route, `${noAlt.length} image(s) with no alt attribute`);

  if (!page.ld.includes('BreadcrumbList') && route !== '/')
    note(route, 'has no breadcrumb data');

  // Prose, or a phrase repeated until it ranks.
  const meaningful = page.words
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 3);
  const counts = new Map();
  for (const word of meaningful) counts.set(word, (counts.get(word) ?? 0) + 1);
  const [term, n] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
  if (meaningful.length > 0 && n / meaningful.length > DENSITY_MAX)
    note(route, `"${term}" is ${((n / meaningful.length) * 100).toFixed(1)}% of the page`);
}

// Titles and descriptions have to be the page's own, or two pages are
// competing for the same result and Google picks one.
for (const field of ['title', 'description']) {
  const seen = new Map();
  for (const [route, page] of pages) {
    const value = page[field];
    if (!seen.has(value)) seen.set(value, []);
    seen.get(value).push(route);
  }
  for (const [value, routes] of seen) {
    if (routes.length > 1) {
      problems.push(`${routes.join(' and ')} share a ${field}: "${value.slice(0, 60)}…"`);
    }
  }
}

// And the generated families have to stay distinct from each other. Twelve
// town pages that are one page with the name swapped are doorway pages, and
// having them is treated as a reason to trust the whole site less.
const trigrams = (words) => {
  const out = new Set();
  for (let i = 0; i + 2 < words.length; i++) {
    out.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`.toLowerCase());
  }
  return out;
};

const families = {
  'town pages': (r) => r.startsWith('/car-rental/'),
  'car pages': (r) => r.startsWith('/cars/'),
  'service pages in a town': (r) => /^\/(bikes|wedding-cars|monthly|tourist-vehicles)\/.+/.test(r),
  articles: (r) => r.startsWith('/blog/'),
};

const report = [];

for (const [name, belongs] of Object.entries(families)) {
  const members = routes.filter((r) => belongs(r) && pages.has(r));
  if (members.length < 2) continue;

  const grams = members.map((r) => [r, trigrams(pages.get(r).words)]);
  let worst = { value: 0 };

  for (let i = 0; i < grams.length; i++) {
    for (let j = i + 1; j < grams.length; j++) {
      let shared = 0;
      for (const gram of grams[i][1]) if (grams[j][1].has(gram)) shared++;
      const union = grams[i][1].size + grams[j][1].size - shared;
      const value = union === 0 ? 0 : shared / union;
      if (value > worst.value) worst = { value, a: grams[i][0], b: grams[j][0] };
    }
  }

  report.push(
    `  ${name}: ${members.length} pages, closest pair ${(worst.value * 100).toFixed(1)}% alike`,
  );
  if (worst.value > OVERLAP_MAX) {
    problems.push(
      `${worst.a} and ${worst.b} are ${(worst.value * 100).toFixed(1)}% the same page`,
    );
  }
}

const words = [...pages.values()].map((p) => p.words.length);
console.log(`seo-audit: ${pages.size} pages`);
console.log(
  `  words: ${Math.min(...words)} shortest, ${Math.round(words.reduce((a, b) => a + b, 0) / words.length)} average`,
);
console.log(report.join('\n'));

if (problems.length === 0) {
  console.log('  nothing flagged');
  process.exit(0);
}

console.error(`\nseo-audit: ${problems.length} problem(s):`);
for (const problem of problems) console.error(`  ${problem}`);
process.exit(1);
