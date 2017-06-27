/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { ScriptLine } from '../utils/stack-frame';

test('script line shape', () => {
  expect(new ScriptLine(5, 'foobar', true)).toMatchSnapshot();
});

test('script line to provide default highlight', () => {
  expect(new ScriptLine(5, 'foobar')).toMatchSnapshot();
});
