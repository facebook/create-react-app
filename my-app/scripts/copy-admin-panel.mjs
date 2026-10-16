// Copies the PHP admin panel into the build output, so it ships with the site.
//
// Hostinger deploys this repository by running `npm run build` and serving
// my-app/dist. That means dist is the document root: anything not in it does
// not exist as far as the web is concerned, which is why niteshacars.in/admin
// returned the site's own "page not found" while the panel sat perfectly well
// in the repository.
//
// Vite copies public/ verbatim into dist/, so the panel could simply live
// there -- but public/ is for the website's own assets, and burying a PHP
// application inside it would be a surprise to anyone reading the tree. This
// copies it explicitly instead, after the build, where the intent is visible.
//
// config.php is never copied. It holds the database password, it is gitignored,
// and dist is rebuilt from scratch on every deploy -- so anything written into
// it is temporary by construction. The panel finds its configuration outside
// the build output; see config() in the panel's src/db.php.

import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(dirname(root), 'admin');
const target = join(root, 'dist', 'admin');

// Never ship these. The test tooling is not a security boundary, but it is
// noise on a public server and some of it takes arguments.
const SKIP = new Set(['config.php', '.ftp-deploy-sync-state.json', '.ftp-deploy-admin-state.json']);

try {
  await stat(source);
} catch {
  console.error(`copy-admin-panel: no panel at ${source}`);
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(dirname(target), { recursive: true });

let copied = 0;
await cp(source, target, {
  recursive: true,
  filter: (src) => {
    const name = src.slice(src.lastIndexOf('/') + 1);
    if (SKIP.has(name)) return false;
    copied += 1;
    return true;
  },
});

console.log(`copy-admin-panel: ${copied} entries into dist/admin`);
