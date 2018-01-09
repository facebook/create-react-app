/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getLinesAround } from '../utils/getLinesAround';

const arr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

test('should return lines around from a string', () => {
  expect(getLinesAround(4, 2, arr)).toMatchSnapshot();
});

test('should return lines around from an array', () => {
  expect(getLinesAround(4, 2, arr.join('\n'))).toMatchSnapshot();
});
