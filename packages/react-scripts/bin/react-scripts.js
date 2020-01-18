#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('react-dev-utils/crossSpawn');
const commander = require('commander');
const packageJson = require('../package.json');

function popNodeArgs() {
  const args = process.argv.slice(2);

  // These commands will pass node arguments to the script
  const nodeArgsCmds = ['eject', 'start', 'test'];
  const cmdIndex = args.findIndex(x => nodeArgsCmds.includes(x));
  const nodeArgs = cmdIndex >= 0 ? args.splice(0, cmdIndex) : [];
  const argvWithoutNodeArgs = process.argv.slice(0, 2).concat(args);
  return [nodeArgs, argvWithoutNodeArgs];
}

const [nodeArgs, argvWithoutNodeArgs] = popNodeArgs();

function execScript(script, scriptArgs) {
  const result = spawn.sync(
    'node',
    nodeArgs.concat(require.resolve('../scripts/' + script)).concat(scriptArgs),
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

const program = new commander.Command(packageJson.name).version(
  packageJson.version
);

program
  .command('start')
  .description('Runs the app in the development mode.')
  .option('--port <port>', 'Specify port', 3000)
  .option('--host <host>', 'Specify host', '0.0.0.0')
  .option('--https', 'Use https')
  .action(function(cmd) {
    const opts = cmd.opts();
    if (opts.port) {
      process.env.PORT = opts.port;
    }
    if (opts.host) {
      process.env.HOST = opts.host;
    }
    if (opts.https) {
      process.env.HTTPS = 'true';
    }
    execScript('start', []);
  });
program
  .command('build')
  .description('Builds the app for production to the `build` folder.')
  .action(function() {
    execScript('build', []);
  });
program
  .command('test')
  .description('Launches the test runner in the interactive watch mode.')
  .action(function() {
    execScript('test', []);
  });

program
  .command('eject')
  .description('Eject config.')
  .action(function() {
    execScript('eject', []);
  });

program.parse(argvWithoutNodeArgs);
