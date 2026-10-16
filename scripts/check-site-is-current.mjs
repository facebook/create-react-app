import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceHash, SOURCE_PATHS } from './source-hash.mjs';

/**
 * Fails when the site committed at the top level was not built from this
 * source.
 *
 * Hostinger clones this repository into the document root and runs no build,
 * so whatever sits at the top level IS the website. A change under my-app/ or
 * admin/ that does not also update those files never reaches the server, and
 * nothing reports a problem: the deploy succeeds, the site keeps serving the
 * previous build, and the only symptom is that the thing you changed is not
 * there. This makes that loud.
 *
 * It writes nothing and pushes nothing. The fix is a person running
 * `npm run publish:site` and committing, because a workflow that could commit
 * the fix would also be a workflow that can push to main unattended, which is
 * a far larger permission than catching a stale folder is worth.
 */

const root = dirname(dirname(fileURLToPath(import.meta.url)));

let build;
try {
  build = JSON.parse(readFileSync(join(root, 'build.json'), 'utf8'));
} catch {
  fail('There is no build.json at the top level, so no site has been published.');
}

const now = sourceHash(root);

if (now === null) {
  console.log('site-is-current: not a git checkout, so there is nothing to compare. Skipped.');
  process.exit(0);
}

// Published before this check existed. Nothing to compare against, and failing
// over it would only say "this commit is older than this check".
if (!build.sourceHash) {
  console.log(
    'site-is-current: this build predates the source fingerprint. ' +
      'The next `npm run publish:site` adds one.',
  );
  process.exit(0);
}

if (build.sourceHash === now) {
  console.log(`site-is-current: the committed site was built from this source (${now}).`);
  process.exit(0);
}

fail(
  `The site committed at the top level was built from different source, so these changes will not reach the website.

  published from  ${build.sourceHash}   (${build.commit ?? 'unknown commit'}, ${build.publishedAt ?? 'unknown time'})
  this source is  ${now}`,
);

function fail(message) {
  console.error(`::error::${message.split('\n')[0]}`);
  console.error('');
  console.error(message);
  console.error('');
  console.error('Hostinger clones this repository into the document root and runs no');
  console.error('build, so the site keeps serving whatever is committed here.');
  console.error('');
  console.error('Fix it with:');
  console.error('');
  console.error('    npm run publish:site       # builds, then copies to the top level');
  console.error('    git add -A && git commit');
  console.error('');
  console.error('The fingerprint covers:');
  // The exclusions are git pathspec magic and mean nothing to a reader here.
  for (const path of SOURCE_PATHS.filter((p) => !p.startsWith(':'))) {
    console.error(`    ${path}`);
  }
  process.exit(1);
}
