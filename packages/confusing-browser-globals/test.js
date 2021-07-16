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

it('should contain "event" variable preferring local parameter', () => {
  expect(globals).toContainEqual({
    name: 'event',
    message: 'Use local parameter instead.',
  });
});

it('should contain "location" variable preferring local parameter or window global', () => {
  expect(globals).toContainEqual({
    name: 'location',
    message: 'Use local parameter or window.location instead.',
  });
});

it('should contain "addEventListener" variable preferring local parameter or document global', () => {
  expect(globals).toContainEqual({
    name: 'addEventListener',
    message: 'Use local parameter or document.addEventListener instead.',
  });
});

it('should contain "self" variable preferring local parameter or WorkerGlobalScope global', () => {
  expect(globals).toContainEqual({
    name: 'self',
    message: 'Use local parameter or WorkerGlobalScope.self instead.',
  });
});
