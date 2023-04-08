/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const ignoredFiles = require('../ignoredFiles');

describe('ignore watch files regex', () => {
  it('normal file', () => {
    const appSrc = '/root/src/';
    const isIgnored = ignoredFiles(appSrc).test('/foo');
    const isIgnoredInSrc = ignoredFiles(appSrc).test('/root/src/foo');

    expect(isIgnored).toBe(false);
    expect(isIgnoredInSrc).toBe(false);
  });

  it('node modules', () => {
    const appSrc = '/root/src/';
    const isIgnored = ignoredFiles(appSrc).test('/root/node_modules/foo');

    expect(isIgnored).toBe(true);
  });

  it('node modules inside source directory', () => {
    const appSrc = '/root/src/';
    const isIgnored = ignoredFiles(appSrc).test('/root/src/node_modules/foo');
    const isIgnoredMoreThanOneLevel = ignoredFiles(appSrc).test(
      '/root/src/bar/node_modules/foo'
    );

    expect(isIgnored).toBe(false);
    expect(isIgnoredMoreThanOneLevel).toBe(false);
  });

  it('path contains source directory', () => {
    const appSrc = '/root/src/';
    const isIgnored = ignoredFiles(appSrc).test(
      '/bar/root/src/node_modules/foo'
    );

    expect(isIgnored).toBe(true);
  });

  it('path starts with source directory', () => {
    const appSrc = '/root/src/';
    const isIgnored = ignoredFiles(appSrc).test('/root/src2/node_modules/foo');

    expect(isIgnored).toBe(true);
  });
});
