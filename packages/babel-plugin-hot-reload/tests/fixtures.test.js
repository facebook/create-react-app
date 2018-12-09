'use strict';

const pluginTester = require('babel-plugin-tester');
const hotReload = require('..');
const path = require('path');
const fs = require('fs');

pluginTester({
  plugin: hotReload,
  filename: __filename,
  babelOptions: {
    parserOpts: { plugins: ['jsx', 'dynamicImport'] },
    generatorOpts: {},
    babelrc: false,
  },
  snapshot: true,
  tests: fs
    .readdirSync(path.join(__dirname, '__fixtures__'))
    .map(entry => path.join(__dirname, '__fixtures__', entry))
    .filter(entry => fs.lstatSync(entry).isFile() && entry.endsWith('js'))
    .map(file => ({
      title: path.basename(file, '.js').replace(/-/g, ' '),
      snapshot: !fs.readFileSync(file, 'utf8').includes('no-snap'),
      fixture: file,
    })),
});
