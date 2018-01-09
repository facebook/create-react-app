'use strict';

const { execSync, spawn } = require('child_process');
const { resolve } = require('path');
const { existsSync } = require('fs');
const { platform } = require('os');

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

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

const yarn = shouldUseYarn();
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

let child;
if (yarn) {
  // Yarn does not support concurrency
  child = spawn(lerna, ['bootstrap', '--npm-client=yarn', '--concurrency=1'], {
    stdio: 'inherit',
  });
} else {
  let args = ['bootstrap'];
  if (
    // The Windows filesystem does not handle concurrency well
    windows ||
    // Only newer npm versions support concurrency
    !shouldUseNpmConcurrently()
  ) {
    args.push('--concurrency=1');
  }
  child = spawn(lerna, args, { stdio: 'inherit' });
}

child.on('close', code => process.exit(code));
