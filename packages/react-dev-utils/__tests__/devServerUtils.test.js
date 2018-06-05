/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { prepareProxy } = require('../WebpackDevServerUtils');

const APP_SRC = '/root/src/';
const TARGET = 'http://localhost:8081/';

describe('prepareProxy', () => {
  it('should support string config', () => {
    const proxyConfig = prepareProxy(TARGET, APP_SRC);
    expect(proxyConfig).toEqual([
      {
        changeOrigin: true,
        context: expect.any(Function),
        logLevel: 'silent',
        onError: expect.any(Function),
        onProxyReq: expect.any(Function),
        secure: false,
        target: TARGET,
        ws: true,
        xfwd: true,
      },
    ]);
  });
  it('should support object config as object', () => {
    const proxy = {
      '/api': {
        target: TARGET,
        secure: false,
      },
    };
    const proxyConfig = prepareProxy(proxy, APP_SRC);
    expect(proxyConfig).toEqual([
      {
        context: expect.any(Function),
        onError: expect.any(Function),
        onProxyReq: expect.any(Function),
        secure: false,
        target: TARGET,
      },
    ]);
    expect(!!proxyConfig[0].context('/api')).toEqual(true);
    expect(!!proxyConfig[0].context('/bogus')).toEqual(false);
  });
  it('should support array config', () => {
    const proxy = [
      {
        context: ['/api', '/endpoint'],
        target: TARGET,
      },
    ];
    const proxyConfig = prepareProxy(proxy, APP_SRC);
    expect(proxyConfig).toEqual([
      {
        context: expect.any(Function),
        onError: expect.any(Function),
        onProxyReq: expect.any(Function),
        target: TARGET,
      },
    ]);
    expect(!!proxyConfig[0].context('/bogus')).toBe(false);
    expect(!!proxyConfig[0].context('/api')).toBe(true);
    expect(!!proxyConfig[0].context('/endpoint')).toBe(true);
  });
  it('should support object config as string value', () => {
    // This test should be implemented to pass, but would break
    // backwards compatibility
    jest.spyOn(process, 'exit').mockImplementationOnce(() => {
      throw new Error('process.exit() was called.');
    });
    const proxy = {
      '/controller': 'http://localhost:8081',
    };
    expect(() => prepareProxy(proxy, APP_SRC)).toThrow(
      'process.exit() was called.'
    );
  });
});
