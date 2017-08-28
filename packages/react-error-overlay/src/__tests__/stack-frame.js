/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { StackFrame } from '../utils/stack-frame';

test('proper empty shape', () => {
  const empty = new StackFrame();
  expect(empty).toMatchSnapshot();

  expect(empty.getFunctionName()).toBe('(anonymous function)');
  expect(empty.getSource()).toBe('');
  expect(empty.toString()).toBe('(anonymous function)');
});

test('proper full shape', () => {
  const empty = new StackFrame(
    'a',
    'b.js',
    13,
    37,
    undefined,
    'apple',
    'test.js',
    37,
    13
  );
  expect(empty).toMatchSnapshot();

  expect(empty.getFunctionName()).toBe('a');
  expect(empty.getSource()).toBe('b.js:13:37');
  expect(empty.toString()).toBe('a (b.js:13:37)');
});
