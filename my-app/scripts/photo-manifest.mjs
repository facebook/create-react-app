// Records which photographs actually exist, so the site can use one where it
// has one and fall back to a drawing where it does not.
//
// Doing this at build time rather than in the browser matters: an <img> whose
// file is missing does not fall back, it renders a broken frame on a live
// page. The only way to choose correctly is to know before rendering, and the
// only place that knows is the filesystem.
//
// Drop a file into public/photos and the next build picks it up. Nothing to
// edit, nothing to register -- which is the point, because a manifest someone
// has to remember to update is a manifest that goes stale.

import { readdirSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const photoDir = join(root, 'public', 'photos');
const outFile = join(root, 'src', 'data', 'photos.json');

// Formats a browser will actually decode. A .heic straight off an iPhone is a
// real file and a broken image, so it is not offered to the page.
const USABLE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

let entries = [];
try {
  entries = readdirSync(photoDir, { withFileTypes: true });
} catch {
  mkdirSync(photoDir, { recursive: true });
}

const photos = {};
const skipped = [];

for (const entry of entries) {
  if (!entry.isFile()) continue;
  const ext = extname(entry.name).toLowerCase();
  if (!USABLE.has(ext)) {
    if (!entry.name.startsWith('.') && entry.name !== 'README.md') skipped.push(entry.name);
    continue;
  }
  // The key is the filename without its extension, so `cars-hero.jpg` and
  // `cars-hero.webp` are the same slot -- swapping format is not a rename job.
  //
  // Anything after a double hyphen is words for the address, not part of the
  // slot: `home-hero--self-drive-car-rental-kanyakumari.webp` fills the
  // `home-hero` slot. The two pull in opposite directions otherwise -- a slot
  // wants a short stable key and a URL wants to say what the picture is, and
  // Google reads the file name as one of the few things it knows about an
  // image besides its alt text. This way the file name does both, and a
  // rewording is not a slot change.
  const key = entry.name.slice(0, -ext.length).split('--')[0];
  // A later format wins only if nothing claimed the slot, so replacing a .jpg
  // with a .webp without deleting the .jpg does not produce a coin flip.
  const rank = ['.avif', '.webp', '.jpg', '.jpeg', '.png'].indexOf(ext);
  const current = photos[key];
  if (!current || rank < current.rank) {
    photos[key] = { rank, path: `/photos/${entry.name}` };
  }
}

const manifest = Object.fromEntries(
  Object.entries(photos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => [key, v.path]),
);

mkdirSync(dirname(outFile), { recursive: true });
const next = JSON.stringify(manifest, null, 2) + '\n';

// Only write when something changed. Rewriting an identical file on every dev
// start would retrigger Vite's watcher and loop.
let prev = null;
try {
  prev = readFileSync(outFile, 'utf8');
} catch {
  /* first run */
}
if (prev !== next) writeFileSync(outFile, next);

const count = Object.keys(manifest).length;
console.log(
  `photo-manifest: ${count} photograph${count === 1 ? '' : 's'}` +
    (count ? ` (${Object.keys(manifest).join(', ')})` : ' — using the drawn scenes'),
);
if (skipped.length) {
  console.warn(
    `photo-manifest: ignored ${skipped.join(', ')} — browsers cannot display these; ` +
      'save as .jpg, .webp or .avif',
  );
}
