// Copies the built site to the top level of the repository.
//
// Hostinger's Git deployment clones the whole repository into the document
// root. "Root directory: public_html" is the destination on the server, not a
// folder inside the repository -- which is the opposite of what the setting
// reads like, and is why the site answered 403 through several rounds of
// fixing the wrong thing. Whatever sits at the top level of the deployed
// branch becomes the website, so index.html has to be there.
//
// That means the built site and the source live side by side in one tree. It
// is not pretty. It is what this host does, and the alternative was asking
// someone to change a setting in a control panel every time the arrangement
// changed. The source is blocked from being served by the rules in
// my-app/public/.htaccess, which ships to the same place.
//
//     npm run publish:site
//
// then commit what it changes. Everything it writes is generated -- editing
// one of those files by hand is always wrong, because the next run replaces
// it.

import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceHash } from './source-hash.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'my-app', 'dist');
const manifestPath = join(root, '.site-manifest.json');

// Written and read by this script alone, so it knows what it put there last
// time. Without it, a page removed from the site would sit at the top level
// for good: the folder cannot simply be emptied first, because the source
// lives in it. Named with a dot so .htaccess denies it.
//
// admin/ is deliberately not tracked. It is the panel's source AND part of the
// build output -- the build copies it verbatim -- so deleting it between runs
// would delete the source and leave nothing to copy back.
const NEVER_REMOVE = new Set(['admin']);

try {
  await stat(join(dist, 'index.html'));
} catch {
  console.error(`publish: no build at ${dist}\n  Run the build first:  npm run build`);
  process.exit(1);
}

let previous = [];
try {
  previous = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  // First run, or someone deleted it. Copying over the top is still correct;
  // only the removal of stale files is skipped.
}

for (const entry of previous) {
  if (NEVER_REMOVE.has(entry)) continue;
  await rm(join(root, entry), { recursive: true, force: true });
}

const published = [];
for (const entry of await readdir(dist, { withFileTypes: true })) {
  await cp(join(dist, entry.name), join(root, entry.name), { recursive: true });
  if (!NEVER_REMOVE.has(entry.name)) published.push(entry.name);
}

// A note of which build this is, served at /build.json.
//
// Publishing here is two steps -- run this, then commit and push -- and the
// deploy is a third that happens on a different machine. Every gap between
// them looks the same from a browser: the change is not there. "The pictures
// I uploaded do not show" was that, twice: the panel was storing them
// correctly the whole time and the website on the server was an older build
// that did not yet ask for them.
//
// So the server carries the date of the build it is running, and
// fleet-check.html reads it back. It turns "is the deploy stale?" from a
// question nobody can answer into one line on a page.
const buildInfo = {
  publishedAt: new Date().toISOString(),
  commit: gitOutput(['rev-parse', '--short', 'HEAD']),
  commitAt: gitOutput(['log', '-1', '--format=%cI']),
  // A fingerprint of the source this was built from, which is what the "Site
  // is current" workflow compares against. See scripts/source-hash.mjs for
  // why it is this rather than a rebuild.
  sourceHash: sourceHash(root),
  // The hashed bundle names. Two servers disagreeing about these is the whole
  // of a stale deploy, in a form that can be compared at a glance.
  assets: (await readdir(join(dist, 'assets')).catch(() => [])).sort(),
};

await writeFile(join(root, 'build.json'), JSON.stringify(buildInfo, null, 2) + '\n');
published.push('build.json');

// The three files whose absence takes the whole site or the whole panel down,
// checked here rather than discovered in a browser: no index.html at the top
// level is a 403 on the domain itself, which is the failure this script exists
// to stop happening again.
const required = ['index.html', '.htaccess', join('admin', 'index.php')];
const missing = [];
for (const file of required) {
  try {
    await stat(join(root, file));
  } catch {
    missing.push(file);
  }
}

if (missing.length > 0) {
  console.error(`publish: the build produced no ${missing.join(', ')} — refusing to publish a broken site.`);
  process.exit(1);
}

await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(published.sort(), null, 2) + '\n');

console.log(
  `publish: ${published.length} entries at the top level — commit them, and the next push is the deploy`,
);

/** One line of `git`, or null outside a checkout. Never fatal: this is a note. */
function gitOutput(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
