// AVIF siblings for the committed pictures.
//
// Two images in public/ are fetched above the fold by every visitor: the
// banner on the home page -- which is the home page's largest contentful
// paint, so it is literally what Google times the page by -- and the logo
// lockup in the header of every page. Both already have hand-made -800w.webp
// style copies beside them at the widths the markup asks for. This writes an
// .avif next to each of those, at the same widths.
//
// AVIF only. The WebP copies are the owner's own encodes and are left exactly
// as they are: re-encoding a lossy file into a lossy file loses a generation
// for nothing, and the gain here is the format, not the quality setting. Every
// byte this saves is saved without touching what already works.
//
//     node scripts/image-variants.mjs
//
// It runs first in `npm run build`, and everything it writes lands in public/
// and is committed -- because Hostinger clones this repository into the
// document root and runs no build, so a file that exists only in a build is a
// file the website does not have.
//
// Alongside WebP rather than instead of it. Safari has read AVIF since 16.4
// and Chrome since 85, which is nearly everybody, but <picture> costs nothing
// for the ones it is not: a browser that cannot read the AVIF source skips it
// and takes the WebP underneath, which is the file it gets today.
//
// Like fetch-content.mjs, this never fails the build. sharp is a native
// dependency, and a machine that cannot install it should still be able to
// publish the site from what is committed -- it just publishes the pictures
// that are already there, and says so.

import { createRequire } from 'node:module';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');

/**
 * What to make, and how wide.
 *
 * The widths are the ones the components ask for in their srcSet, and the two
 * lists have to agree: a width here the markup never names is a file nobody
 * downloads, and a width in the markup missing here is a 404 at exactly the
 * screen size that asks for it.
 *
 * quality is per picture because they are different kinds of image. The
 * photograph carries noise and gradients and hides a lower number; the logo is
 * flat colour and hard edges, where the same number shows as mush around the
 * lettering.
 */
const PICTURES = [
  {
    file: 'mountain-road-at-sunrise-self-drive-car-rental.webp',
    widths: [800, 1280],
    quality: 52,
  },
  {
    file: 'nitesha-cars-and-bikes-logo-nagercoil-v2.webp',
    widths: [240, 400, 800],
    quality: 60,
  },
];

let sharp;
try {
  sharp = createRequire(import.meta.url)('sharp');
} catch {
  console.log(
    'image-variants: sharp is not installed, so the committed pictures are left as they are.',
  );
  process.exit(0);
}

const written = [];
const kept = [];

for (const picture of PICTURES) {
  const source = join(publicDir, picture.file);

  let original;
  try {
    original = await readFile(source);
  } catch {
    console.log(`image-variants: ${picture.file} is not in public/, skipping it.`);
    continue;
  }

  const full = original.byteLength;
  const stem = picture.file.replace(/\.webp$/, '');

  // The full-size AVIF as well as the narrow ones: it is the last entry in
  // every srcSet, and a desktop at two times density really does ask for it.
  const jobs = [
    { name: `${stem}.avif`, width: null },
    ...picture.widths.map((w) => ({ name: `${stem}-${w}w.avif`, width: w })),
  ];

  for (const job of jobs) {
    const target = join(publicDir, job.name);

    // Only when the source is newer, so a publish that changes nothing
    // rewrites nothing -- an encoder is not required to be byte-for-byte
    // repeatable, and a file that changes on every run is a file that shows up
    // in every commit.
    const sourceTime = (await stat(source)).mtimeMs;
    const targetTime = await stat(target).then((s) => s.mtimeMs).catch(() => 0);
    if (targetTime > sourceTime) {
      kept.push(job.name);
      continue;
    }

    let pipeline = sharp(original);
    if (job.width) pipeline = pipeline.resize({ width: job.width, withoutEnlargement: true });

    const out = await pipeline.avif({ quality: picture.quality, effort: 6 }).toBuffer();
    await writeFile(target, out);
    written.push({ name: job.name, bytes: out.byteLength, of: full });
  }
}

/**
 * The icons a search engine looks for.
 *
 * The site declared an SVG favicon and a 180px apple-touch icon, and nothing
 * else -- so /favicon.ico, which Google's favicon crawler and most other tools
 * request whether a page names it or not, answered with the 404 page.
 *
 * Google asks that a raster favicon be a square whose side is a multiple of
 * 48. 64 (the SVG's box) and 180 (the Apple icon) are neither, so even when it
 * found one it had nothing of the size it wants. These are 48, 96, 144 and 192
 * -- one, two, three and four times 48 -- rendered from the same artwork.
 *
 * The SVG stays and stays first: a browser that reads it gets a mark that is
 * sharp at any size. These are for everything else.
 */
const ICON_SOURCE = 'favicon.svg';
const ICON_SIZES = [48, 96, 144, 192];

async function writeIcons() {
  const source = join(publicDir, ICON_SOURCE);
  let artwork;
  try {
    artwork = await readFile(source);
  } catch {
    console.log(`image-variants: no ${ICON_SOURCE}, so no raster icons.`);
    return;
  }

  const sourceTime = (await stat(source)).mtimeMs;

  for (const size of ICON_SIZES) {
    const name = `favicon-${size}.png`;
    const target = join(publicDir, name);
    const targetTime = await stat(target).then((t) => t.mtimeMs).catch(() => 0);
    if (targetTime > sourceTime) { kept.push(name); continue; }

    const out = await sharp(artwork, { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(target, out);
    written.push({ name, bytes: out.byteLength, of: out.byteLength });
  }

  // favicon.ico, from the 48px rendering. One size inside it rather than the
  // usual three: every browser that still asks for this file reads a 48, and a
  // 16 and a 32 beside it are two more things to regenerate for nobody.
  const icoTarget = join(publicDir, 'favicon.ico');
  const icoTime = await stat(icoTarget).then((t) => t.mtimeMs).catch(() => 0);
  if (icoTime > sourceTime) {
    kept.push('favicon.ico');
  } else {
    const png = await sharp(artwork, { density: 384 })
      .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(icoTarget, icoFrom(png, 48));
    written.push({ name: 'favicon.ico', bytes: png.byteLength + 22, of: png.byteLength + 22 });
  }
}

/**
 * A one-image .ico wrapping a PNG.
 *
 * The format allows a PNG payload rather than a bitmap, which every browser
 * that matters has read since IE11, and it saves pulling in a library to write
 * 22 bytes of header.
 */
function icoFrom(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);          // reserved
  header.writeUInt16LE(1, 2);          // type: icon
  header.writeUInt16LE(1, 4);          // one image
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt8(0, 8);             // palette: not used
  header.writeUInt8(0, 9);             // reserved
  header.writeUInt16LE(1, 10);         // colour planes
  header.writeUInt16LE(32, 12);        // bits per pixel
  header.writeUInt32LE(png.byteLength, 14);
  header.writeUInt32LE(22, 18);        // the payload starts after this header
  return Buffer.concat([header, png]);
}

await writeIcons();

if (written.length === 0) {
  console.log(`image-variants: ${kept.length} copies already current, nothing to write.`);
} else {
  for (const w of written) {
    console.log(
      `image-variants: ${w.name} — ${(w.bytes / 1024).toFixed(1)} KB` +
        ` (${Math.round((w.bytes / w.of) * 100)}% of the original)`,
    );
  }
  console.log(
    `image-variants: wrote ${written.length}, left ${kept.length} already current.` +
      ' Commit what changed -- the server runs no build.',
  );
}
