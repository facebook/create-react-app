#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const execa = require('execa');
const meow = require('meow');
const multimatch = require('multimatch');

main(meow());

function main(cli) {
  let count = 0;

  const start = Date.now();
  const duration = parseInt(cli.flags.timeout, 10) * 1000;
  const cp = execa(cli.flags.command, { shell: true });

  const target = parseInt(cli.flags.patternCount || '1', 10);

  cp.stdout.on('data', data => {
    process.stdout.write(data);
    const matches = multimatch([String(data)], cli.flags.pattern);
    const errMatches = multimatch([String(data)], cli.flags.errorPattern);

    if (matches.length > 0) {
      count++;
    }

    if (errMatches.length > 0) {
      process.exit(1);
    }

    if (count >= target) {
      setTimeout(() => {
        process.exit(0);
      }, duration);
    }
  });

  cp.on('exit', e => {
    const elapsed = Date.now() - start;

    if (elapsed >= duration) {
      return;
    }

    setTimeout(() => {
      process.exit(e.exitCode);
    }, duration - elapsed);
  });
}
