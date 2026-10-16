import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Bakes the vehicle list into the build.
 *
 * The fleet lives in the admin panel's database and the site read it from the
 * browser, which meant the two pages that sell the business -- /cars and
 * /tariff -- were served to Google as "Fetching the current fleet…" and
 * "Loading the rate card…". Googlebot does render JavaScript, but it does so
 * on a second pass, days later, at its own discretion; and nothing else that
 * reads a page does it at all. A site competing for "Swift self drive
 * Nagercoil" cannot have the word Swift arrive after the crawl.
 *
 * So the list is fetched here, before Vite runs, and written into the bundle.
 * The browser still asks the panel on load, so a car added this morning still
 * appears this morning -- the baked copy is the floor, not the ceiling.
 *
 * Never fails the build, for the same reason fetch-content.mjs does not: a
 * shared host having a bad minute must not stop a deploy. If the panel cannot
 * be reached, whatever is already committed in fleet.json stays, and the log
 * says so.
 *
 * A rate of 0 means "not published here". It prints as "On request", never as
 * a figure -- a tariff is a promise, and one nobody at the business typed is
 * not a promise they can keep.
 */

const here = dirname(fileURLToPath(import.meta.url));
const app = dirname(here);

const SNAPSHOT = join(app, 'src/data/fleet.json');

const { site } = JSON.parse(await readFile(join(app, 'src/data/seo.json'), 'utf8'));
const API = process.env.FLEET_API ?? `${site.origin}/admin/api/public-vehicles.php`;

const TIMEOUT_MS = 10_000;

const current = JSON.parse(await readFile(SNAPSHOT, 'utf8'));

/** Only the columns the site renders, and only in the shapes it renders. */
function clean(v) {
  const num = (x) => (typeof x === 'number' && Number.isFinite(x) && x > 0 ? x : 0);
  const pick = (x, allowed, fallback) => (allowed.includes(x) ? x : fallback);

  if (!v || typeof v !== 'object') return null;
  if (typeof v.id !== 'string' || typeof v.name !== 'string' || v.name.trim() === '') return null;

  return {
    id: v.id,
    brand: typeof v.brand === 'string' ? v.brand : '',
    name: v.name,
    bodyType: pick(v.bodyType, ['Hatchback', 'Sedan', 'SUV', 'MUV'], 'Hatchback'),
    fuel: pick(v.fuel, ['Petrol', 'Diesel', 'Electric', 'CNG'], 'Petrol'),
    transmission: pick(v.transmission, ['Manual', 'Automatic'], 'Manual'),
    seats: num(v.seats) || 5,
    year: num(v.year),
    rateDaily: num(v.rateDaily),
    ...(num(v.rateDailyMax) ? { rateDailyMax: num(v.rateDailyMax) } : {}),
    ...(num(v.rateWeekly) ? { rateWeekly: num(v.rateWeekly) } : {}),
    ...(num(v.rateMonthly) ? { rateMonthly: num(v.rateMonthly) } : {}),
    kmLimitPerDay: num(v.kmLimitPerDay),
    extraKmRate: num(v.extraKmRate),
    deposit: num(v.deposit),
    // Deliberately not the photograph. The panel serves those from its own
    // URL, which is fine in the browser and wrong in a prerender: the file
    // may be gone by the time the page is crawled, and a 404 in the markup
    // is worse than the drawing the site falls back to.
    available: true,
  };
}

if (process.env.FLEET_API === 'off') {
  console.log('fetch-fleet: skipped, using the committed snapshot');
  process.exit(0);
}

try {
  const res = await fetch(API, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`the server answered ${res.status}`);

  const body = await res.json();
  if (!body?.ok || !Array.isArray(body.vehicles)) {
    throw new Error('the response was not the expected { ok, vehicles } shape');
  }

  const vehicles = body.vehicles.map(clean).filter(Boolean);

  // An empty answer is a data question, not a plumbing one -- but overwriting
  // a good snapshot with nothing would take the fleet off the prerendered
  // pages on the strength of it. The committed list stays and the log asks.
  if (vehicles.length === 0) {
    console.warn(
      'fetch-fleet: the panel answered with zero vehicles, so the committed ' +
        'snapshot stays. Check that vehicles are not all set to Maintenance ' +
        'or Inactive, and that they have a rate card dated today or earlier.',
    );
    process.exit(0);
  }

  const next = {
    note: current.note,
    fetched: new Date().toISOString(),
    live: true,
    vehicles,
  };

  await writeFile(SNAPSHOT, JSON.stringify(next, null, 2) + '\n');
  console.log(`fetch-fleet: ${vehicles.length} vehicles baked in from the panel`);
} catch (error) {
  console.warn(
    `fetch-fleet: could not read ${API} — ${error?.message ?? 'unknown error'}. ` +
      `Keeping the committed snapshot (${current.vehicles.length} vehicles).`,
  );
}
