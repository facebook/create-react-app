#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x =>
    x === 'babel' ||
    x === 'build' ||
    x === 'eject' ||
    x === 'start' ||
    x === 'test' ||
    x === 'dev' ||
    'eslint' ||
    'prettier'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

switch (script) {
  case 'build':
  case 'eject':
  case 'start':
  case 'dev':
  case 'test':
    {
      const result = spawn.sync(
        'node',
        nodeArgs
          .concat(require.resolve('../scripts/' + script))
          .concat(args.slice(scriptIndex + 1)),
        { stdio: 'inherit' }
      );
      if (result.signal) {
        if (result.signal === 'SIGKILL') {
          console.log(
            'The build failed because the process exited too early. ' +
              'This probably means the system ran out of memory or someone called ' +
              '`kill -9` on the process.'
          );
        } else if (result.signal === 'SIGTERM') {
          console.log(
            'The build failed because the process exited too early. ' +
              'Someone might have called `kill` or `killall`, or the system could ' +
              'be shutting down.'
          );
        }
        process.exit(1);
      }
      process.exit(result.status);
    }
    break;
  case 'babel':
    {
      const result = spawn.sync(
        'node',
        nodeArgs
          .concat(require.resolve('../node_modules/.bin/babel'))
          .concat([
            '--no-babelrc',
            '--presets=' + require.resolve('babel-preset-react-app'),
          ])
          .concat(args.slice(scriptIndex + 1)),
        { stdio: 'inherit' }
      );

      if (result.signal) {
        if (result.signal === 'SIGKILL') {
          console.log(
            'The build failed because the process exited too early. ' +
              'This probably means the system ran out of memory or someone called ' +
              '`kill -9` on the process.'
          );
        } else if (result.signal === 'SIGTERM') {
          console.log(
            'The build failed because the process exited too early. ' +
              'Someone might have called `kill` or `killall`, or the system could ' +
              'be shutting down.'
          );
        }
        process.exit(1);
      }
      process.exit(result.status);
    }
    break;
  case 'eslint':
  case 'prettier':
    {
      const path = require('path');
      const paths = require('../config/paths');

      const eslintBin = path.resolve(
        path.dirname(require.resolve('eslint')),
        '../bin/eslint.js'
      );
      const prettierBin = path.resolve(
        path.dirname(require.resolve('prettier')),
        './bin/prettier.js'
      );

      let cmdArgs = [];
      if (script === 'eslint') {
        cmdArgs.push(eslintBin);
      } else {
        cmdArgs.push(prettierBin);
      }

      // pass on args as-is
      if (args.length > 1) {
        cmdArgs = cmdArgs.concat(args.slice(1));
      }

      const result = spawn.sync('node', cmdArgs, {
        stdio: 'inherit',
        cwd: paths.appPath,
      });
      if (result.signal) {
        if (result.signal === 'SIGKILL' || result.signal === 'SIGTERM') {
          console.log(
            'The command failed because the process exited too early. ' +
              'This probably means the system ran out of memory or someone called ' +
              'killed the process.'
          );
        }
        process.exit(1);
      }
      process.exit(result.status);
    }
    break;

  default:
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update react-scripts?');
    console.log(
      'See: https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases'
    );
    break;
}
