/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ScriptLine } from '../utils/stack-frame';

test('script line shape', () => {
  expect(new ScriptLine(5, 'foobar', true)).toMatchSnapshot();
});

test('script line to provide default highlight', () => {
  expect(new ScriptLine(5, 'foobar')).toMatchSnapshot();
});
