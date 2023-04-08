#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const tempy = require('tempy');

main();

function main() {
  const previous = process.cwd();
  const cwd = tempy.directory();

  const cast = path.join(cwd, 'screencast.json');
  const script = path.join(__dirname, 'screencast.sh');
  const out = path.join(previous, 'screencast.svg');

  const resolveLine = l => l.indexOf('🔍  Resolving packages...') > -1;
  const fetchLine = l => l.indexOf('🚚  Fetching packages...') > -1;
  const countLine = l => l.match(/Saved [0-9]+ new dependencies/);
  const doneLine = l => l.indexOf('✨  Done in') > -1;

  try {
    process.chdir(cwd);
    console.log(`Recording screencast ...`);
    execa.sync('asciinema', ['rec', '--command', `sh ${script}`, cast], {
      cwd,
      stdio: 'inherit',
    });

    console.log('Cleaning data ...');
    const data = require(cast);

    cut(data.stdout, { start: resolveLine, end: fetchLine });
    cut(data.stdout, { start: countLine, end: doneLine });
    replace(data.stdout, [{ in: cwd, out: '~' }]);

    fs.writeFileSync(cast, JSON.stringify(data, null, '  '));

    console.log('Rendering SVG ...');
    execa.sync('svg-term', ['--window', '--in', cast, '--out', out]);

    console.log(`Recorded screencast to ${cast}`);
    console.log(`Rendered SVG to ${out}`);
  } finally {
    process.chdir(previous);
  }
}

function cut(frames, { start, end }) {
  const si = frames.findIndex(([, l]) => start(l));
  const ei = frames.findIndex(([, l]) => end(l));

  if (si === -1 || ei === -1) {
    return;
  }

  frames.splice(si + 1, ei - si - 1);
}

function replace(frames, replacements) {
  frames.forEach(frame => {
    replacements.forEach(r => (frame[1] = frame[1].split(r.in).join(r.out)));
  });
}
