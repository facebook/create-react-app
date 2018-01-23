'use strict';

const { execSync } = require('child_process');
const { resolve } = require('path');
const { existsSync } = require('fs');
const { platform } = require('os');
const crossSpawn = require('cross-spawn');

// function shouldUseYarn() {
//   try {
//     execSync('yarnpkg --version', { stdio: 'ignore' });
//     return true;
//   } catch (e) {
//     return false;
//   }
// }

function shouldUseNpmConcurrently() {
  try {
    const versionString = execSync('npm --version');
    const m = /^(\d+)[.]/.exec(versionString);
    // NPM >= 5 support concurrent installs
    return Number(m[1]) >= 5;
  } catch (e) {
    return false;
  }
}

// const yarn = shouldUseYarn();
const yarn = false;
const windows = platform() === 'win32';
const lerna = resolve(
  __dirname,
  'node_modules',
  '.bin',
  windows ? 'lerna.cmd' : 'lerna'
);

if (!existsSync(lerna)) {
  if (yarn) {
    console.log('Cannot find lerna. Please run `yarn --check-files`.');
  } else {
    console.log(
      'Cannot find lerna. Please remove `node_modules` and run `npm install`.'
    );
  }
  process.exit(1);
}

let args = ['bootstrap'].concat(process.argv.slice(2));
if (yarn) {
  // Yarn does not support concurrency
  crossSpawn.sync(
    lerna,
    args.concat(['--npm-client=yarn', '--concurrency=1']),
    {
      stdio: 'inherit',
    }
  );
} else {
  if (
    // The Windows filesystem does not handle concurrency well
    windows ||
    // Only newer npm versions support concurrency
    !shouldUseNpmConcurrently()
  ) {
    args.push('--concurrency=1');
  }
  crossSpawn.sync(lerna, args, { stdio: 'inherit' });
}
