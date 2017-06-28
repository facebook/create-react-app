'use strict';

const { execSync, spawn } = require('child_process');
const { resolve } = require('path');
const { existsSync } = require('fs');

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

const yarn = shouldUseYarn();
const lerna = resolve(__dirname, 'node_modules', '.bin', 'lerna');
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
  child = spawn(lerna, ['bootstrap', '--npm-client=yarn'], {
    stdio: 'inherit',
  });
} else {
  child = spawn(lerna, ['bootstrap'], { stdio: 'inherit' });
}

child.on('close', code => process.exit(code));
