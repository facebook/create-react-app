'use strict';

const pluginTester = require('babel-plugin-tester');
const hotReload = require('..');
const path = require('path');

pluginTester({
  plugin: hotReload,
  filename: __filename,
  babelOptions: {
    parserOpts: { plugins: ['jsx'] },
    generatorOpts: {},
    babelrc: false,
  },
  snapshot: true,
  tests: [
    {
      title: 'single default',
      fixture: path.join(__dirname, 'fixtures', 'single-default-export.js'),
      snapshot: true,
    },
  ],
});
