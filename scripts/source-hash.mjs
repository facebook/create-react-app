import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A fingerprint of the source the site is built from.
 *
 * publish-site.mjs writes this into build.json; the "Site is current" workflow
 * recomputes it and compares. If they differ, source has changed since the
 * site at the top level was published, and the change will not reach the
 * server -- because Hostinger clones this repository into the document root
 * and runs no build, so whatever is committed at the top level IS the website.
 *
 * This replaces rebuilding and diffing the output, which could not work and
 * had not worked since the panel came online. A build embeds the copy, the
 * fleet and the places the panel is serving at the moment it runs, and the
 * workflow has no way to reproduce those: the copy lands in live.json, which
 * is not committed, and the rest changes whenever the owner edits anything.
 * So the rebuild differed every time, the check was red on every pull request
 * and on main, and a check that is always red is a check nobody reads.
 *
 * Hashing the inputs instead answers the question the workflow was written to
 * ask -- was this site built from this source? -- and is deterministic,
 * needs no npm install and takes about a second.
 *
 * What it cannot tell you is whether the copy baked into the HTML is the
 * newest the panel has. Nothing could, from a checkout. It does not matter
 * much: the browser asks the panel on load and replaces it, so stale baked
 * copy costs a crawler a build's worth of freshness and costs a visitor
 * nothing.
 */

/**
 * The files whose contents decide what the build produces.
 *
 * admin/ is in here because copy-admin-panel.mjs copies it into the output
 * verbatim -- a change to the panel's PHP is a change to what gets deployed,
 * and it reaches the server by exactly the same route.
 *
 * scripts/ is in here because these files are what does the publishing. A
 * change to how the site is assembled is a change to the site -- except for
 * the two files that do the checking rather than the assembling. Without that
 * exclusion, editing this very file would report the site as stale, which is
 * the kind of false failure that got the old check ignored.
 */
export const SOURCE_PATHS = [
  'admin',
  'scripts',
  ':(exclude)scripts/source-hash.mjs',
  ':(exclude)scripts/check-site-is-current.mjs',
  'my-app/src',
  'my-app/scripts',
  'my-app/public',
  'my-app/index.html',
  'my-app/package.json',
  'my-app/package-lock.json',
  'my-app/vite.config.ts',
  'my-app/tsconfig.json',
  'my-app/tsconfig.app.json',
  'my-app/tsconfig.node.json',
];

/**
 * The hash, or null outside a git checkout.
 *
 * Listed by git rather than walked: node_modules, dist and everything else
 * ignored is ignored here for free, and by the same rules the repository
 * already uses rather than by a second list that would drift.
 *
 * Tracked files AND files that are not ignored but not yet added -- which is
 * exactly the set `git add -A` would commit. Tracked alone was wrong in a way
 * that took a red check to find: publishing happens before committing, so a
 * change that introduces a new file hashed everything except that file, and
 * the hash then changed the moment it was committed. Every commit that added
 * a source file would have failed this check.
 *
 * Contents from disk rather than from the index, so publishing hashes what is
 * about to be committed rather than what was committed last time.
 */
export function sourceHash(root) {
  let files;
  try {
    files = execFileSync(
      'git',
      ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...SOURCE_PATHS],
      { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    )
      .split('\0')
      .filter(Boolean)
      .sort();
  } catch {
    return null;
  }

  if (files.length === 0) return null;

  const hash = createHash('sha256');
  for (const file of files) {
    let contents;
    try {
      contents = readFileSync(join(root, file));
    } catch {
      // Tracked but no longer on disk: a deletion that has not been committed
      // yet. Skipped entirely rather than hashed as a placeholder, so that the
      // file counts the same before the commit and after it -- the same trap
      // that --others above exists to avoid, in the other direction.
      continue;
    }

    // The name as well as the contents: moving a file changes the build even
    // when every byte in it stays the same.
    hash.update(file);
    hash.update('\0');
    hash.update(contents);
    hash.update('\0');
  }

  return hash.digest('hex').slice(0, 16);
}
