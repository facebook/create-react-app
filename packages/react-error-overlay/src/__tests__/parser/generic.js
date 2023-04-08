/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parse } from '../../utils/parser';

test('throws on null', () => {
  let error;
  try {
    parse(null);
  } catch (e) {
    error = e;
  }
  expect(error instanceof Error).toBe(true);
  expect(error.message).toBe('You cannot pass a null object.');
});

test('throws on unparsable', () => {
  let error;
  try {
    parse({});
  } catch (e) {
    error = e;
  }
  expect(error instanceof Error).toBe(true);
  expect(error.message).toBe(
    'The error you provided does not contain a stack trace.'
  );
});
