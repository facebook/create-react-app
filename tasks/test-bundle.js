'use strict';

const chalk = require('chalk');

function fail(msg) {
  console.error(chalk.red(`✘ ${msg}`));
  process.exit(1);
}

function pass(msg) {
  console.log(chalk.green(`✔ ${msg}`));
}

const bundleName = process.argv[2];

if (!bundleName) {
  fail('Must supply a require-able bundle path');
}

const bundle = require(bundleName);

if (typeof bundle !== 'object') {
  fail('Bundle require did not return an object');
}

pass('Loaded bundle successfully');

if (!bundle.hasOwnProperty('default')) {
  fail('bundle does not have a "default" property');
}

pass('Bundle has a default property');

if (typeof bundle.default !== 'function') {
  fail(`bundle.default is not a function, but: ${typeof bundle.default}`);
}

pass("Bundle's default property is a function");

const html = bundle.default();

if (!html.match(/^<div class="App"/)) {
  fail(`Render output doesn't appear valid: ${html}`);
}

pass('Bundle render function generates HTML');

process.exit(0);
