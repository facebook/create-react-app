/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { parse } from '../../utils/parser';

test('throws on null', () => {
  expect.assertions(2);
  try {
    parse(null);
  } catch (e) {
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('You cannot pass a null object.');
  }
});

test('throws on unparsable', () => {
  expect.assertions(2);
  try {
    parse({});
  } catch (e) {
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe(
      'The error you provided does not contain a stack trace.'
    );
  }
});
