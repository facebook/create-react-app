import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Bakes the places list into the build.
 *
 * Same problem the fleet had, and the same fix. /places was fetched in the
 * browser, so the page a crawler was served said "The list is on its way" --
 * on a page whose entire purpose is to be found by somebody searching for
 * things to do around Kanyakumari and to sell them a car to get there in.
 *
 * Never fails the build; keeps what is committed when the panel cannot be
 * reached, and says so.
 */

const here = dirname(fileURLToPath(import.meta.url));
const app = dirname(here);
const SNAPSHOT = join(app, 'src/data/places.json');

const { site } = JSON.parse(await readFile(join(app, 'src/data/seo.json'), 'utf8'));
const API = process.env.PLACES_API ?? `${site.origin}/admin/api/public-places.php`;

const current = JSON.parse(await readFile(SNAPSHOT, 'utf8'));

if (process.env.PLACES_API === 'off') {
  console.log('fetch-places: skipped, using the committed snapshot');
  process.exit(0);
}

/** Only the fields the page renders, and only in the shapes it renders. */
function clean(p) {
  if (!p || typeof p !== 'object') return null;
  if (typeof p.name !== 'string' || p.name.trim() === '') return null;
  return {
    id: String(p.id ?? p.name),
    name: p.name,
    category: typeof p.category === 'string' ? p.category : '',
    km: Number.isFinite(p.km) && p.km > 0 ? p.km : undefined,
    blurb: typeof p.blurb === 'string' ? p.blurb : '',
    // This ends up in an href. The panel refuses anything but http(s), and the
    // check is repeated because a link that can carry javascript: is a hole
    // wherever it is filled from.
    mapUrl: /^https?:\/\//i.test(p.mapUrl ?? '') ? p.mapUrl : '',
  };
}

try {
  const res = await fetch(API, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`the server answered ${res.status}`);

  const body = await res.json();
  if (!body?.ok || !Array.isArray(body.places)) {
    throw new Error('the response was not the expected { ok, places } shape');
  }

  const places = body.places.map(clean).filter(Boolean);
  if (places.length === 0) {
    console.warn('fetch-places: the panel answered with none, so the committed list stays');
    process.exit(0);
  }

  await writeFile(
    SNAPSHOT,
    JSON.stringify({ note: current.note, fetched: new Date().toISOString(), live: true, places }, null, 2) + '\n',
  );
  console.log(`fetch-places: ${places.length} places baked in from the panel`);
} catch (error) {
  console.warn(
    `fetch-places: could not read ${API} — ${error?.message ?? 'unknown error'}. ` +
      `Keeping the committed list (${current.places.length} places).`,
  );
}
