/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-env jest */

'use strict';

let globals = require('./index');

it('should return an Array of globals', () => {
  expect(Array.isArray(globals)).toBe(true);
});

it('should contain "event" variable', () => {
  expect(globals).toContain('event');
});
