/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { prepareProxy } = require('../WebpackDevServerUtils');

const requests = [
  {
    pathname: '/',
    req: {
      method: 'GET',
      headers: {
        accept: 'text/html',
      },
    },
    expect: false,
  },
  {
    pathname: '/about',
    req: {
      method: 'GET',
      headers: {
        accept: 'text/html',
      },
    },
    expect: false,
  },
  {
    pathname: '/api/fetch',
    req: {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    },
    expect: true,
  },
  {
    pathname: '/api/create',
    req: {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
    },
    expect: true,
  },
  {
    pathname: '/socket/proxy',
    req: {
      method: 'GET',
      headers: {},
    },
    expect: true,
  },
];

describe('follows proxy heuristics', () => {
  let proxy = null;

  beforeAll(() => {
    proxy = prepareProxy('http://localhost:3001', '/public', '/')[0];
  });

  requests.forEach(t => {
    test(`proxies ${t.pathname}`, () => {
      const filter = proxy.context;
      const actual = filter(t.pathname, t.req);
      expect(actual).toBe(t.expect);
    });
  });
});
