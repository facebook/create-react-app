/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const getPublicUrlOrPath = require('../getPublicUrlOrPath');

const tests = [
  // DEVELOPMENT with homepage
  { dev: true, homepage: '/', expect: '/' },
  { dev: true, homepage: '/test', expect: '/test/' },
  { dev: true, homepage: '/test/', expect: '/test/' },
  { dev: true, homepage: './', expect: '/' },
  { dev: true, homepage: '../', expect: '/' },
  { dev: true, homepage: '../test', expect: '/' },
  { dev: true, homepage: './test/path', expect: '/' },
  { dev: true, homepage: 'https://create-react-app.dev/', expect: '/' },
  {
    dev: true,
    homepage: 'https://create-react-app.dev/test',
    expect: '/test/',
  },
  // DEVELOPMENT with publicURL
  { dev: true, publicUrl: '/', expect: '/' },
  { dev: true, publicUrl: '/test', expect: '/test/' },
  { dev: true, publicUrl: '/test/', expect: '/test/' },
  { dev: true, publicUrl: './', expect: '/' },
  { dev: true, publicUrl: '../', expect: '/' },
  { dev: true, publicUrl: '../test', expect: '/' },
  { dev: true, publicUrl: './test/path', expect: '/' },
  { dev: true, publicUrl: 'https://create-react-app.dev/', expect: '/' },
  {
    dev: true,
    publicUrl: 'https://create-react-app.dev/test',
    expect: '/test/',
  },
  // DEVELOPMENT with publicURL and homepage
  { dev: true, publicUrl: '/', homepage: '/test', expect: '/' },
  { dev: true, publicUrl: '/test', homepage: '/path', expect: '/test/' },
  { dev: true, publicUrl: '/test/', homepage: '/test/path', expect: '/test/' },
  { dev: true, publicUrl: './', homepage: '/test', expect: '/' },
  { dev: true, publicUrl: '../', homepage: '/test', expect: '/' },
  { dev: true, publicUrl: '../test', homepage: '/test', expect: '/' },
  { dev: true, publicUrl: './test/path', homepage: '/test', expect: '/' },
  {
    dev: true,
    publicUrl: 'https://create-react-app.dev/',
    homepage: '/test',
    expect: '/',
  },
  {
    dev: true,
    publicUrl: 'https://create-react-app.dev/test',
    homepage: '/path',
    expect: '/test/',
  },

  // PRODUCTION with homepage
  { dev: false, homepage: '/', expect: '/' },
  { dev: false, homepage: '/test', expect: '/test/' },
  { dev: false, homepage: '/test/', expect: '/test/' },
  { dev: false, homepage: './', expect: './' },
  { dev: false, homepage: '../', expect: '../' },
  { dev: false, homepage: '../test', expect: '../test/' },
  { dev: false, homepage: './test/path', expect: './test/path/' },
  { dev: false, homepage: 'https://create-react-app.dev/', expect: '/' },
  {
    dev: false,
    homepage: 'https://create-react-app.dev/test',
    expect: '/test/',
  },
  // PRODUCTION with publicUrl
  { dev: false, publicUrl: '/', expect: '/' },
  { dev: false, publicUrl: '/test', expect: '/test/' },
  { dev: false, publicUrl: '/test/', expect: '/test/' },
  { dev: false, publicUrl: './', expect: './' },
  { dev: false, publicUrl: '../', expect: '../' },
  { dev: false, publicUrl: '../test', expect: '../test/' },
  { dev: false, publicUrl: './test/path', expect: './test/path/' },
  {
    dev: false,
    publicUrl: 'https://create-react-app.dev/',
    expect: 'https://create-react-app.dev/',
  },
  {
    dev: false,
    publicUrl: 'https://create-react-app.dev/test',
    expect: 'https://create-react-app.dev/test/',
  },
  // PRODUCTION with publicUrl and homepage
  { dev: false, publicUrl: '/', homepage: '/test', expect: '/' },
  { dev: false, publicUrl: '/test', homepage: '/path', expect: '/test/' },
  { dev: false, publicUrl: '/test/', homepage: '/test/path', expect: '/test/' },
  { dev: false, publicUrl: './', homepage: '/test', expect: './' },
  { dev: false, publicUrl: '../', homepage: '/test', expect: '../' },
  { dev: false, publicUrl: '../test', homepage: '/test', expect: '../test/' },
  {
    dev: false,
    publicUrl: './test/path',
    homepage: '/test',
    expect: './test/path/',
  },
  {
    dev: false,
    publicUrl: 'https://create-react-app.dev/',
    homepage: '/test',
    expect: 'https://create-react-app.dev/',
  },
  {
    dev: false,
    publicUrl: 'https://create-react-app.dev/test',
    homepage: '/path',
    expect: 'https://create-react-app.dev/test/',
  },
];

describe('getPublicUrlOrPath', () => {
  tests.forEach(t =>
    it(JSON.stringify(t), () => {
      const actual = getPublicUrlOrPath(t.dev, t.homepage, t.publicUrl);
      expect(actual).toBe(t.expect);
    })
  );
});
