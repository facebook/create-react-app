/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parse } from '../../utils/parser';

test('eval 1', () => {
  expect(
    parse(
      `test1@file:///C:/example.html line 7 > eval line 1 > eval:1:1
test2@file:///C:/example.html line 7 > eval:1:1
test3@file:///C:/example.html:7:6`.split('\n')
    )
  ).toMatchSnapshot();
});

test('eval 2', () => {
  expect(
    parse({
      stack: `anonymous@file:///C:/example.html line 7 > Function:1:1
@file:///C:/example.html:7:6`,
    })
  ).toMatchSnapshot();
});

test('stack with eval', () => {
  expect(
    parse(
      `e@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:25:9
@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html line 17 > eval:1:1
a@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:8:9
@file:///Users/joe/Documents/Development/OSS/stack-frame/index.html:32:7`
    )
  ).toMatchSnapshot();
});

test('v14 to v29', () => {
  expect(
    parse(
      `trace@file:///C:/example.html:9
b@file:///C:/example.html:16
a@file:///C:/example.html:19
@file:///C:/example.html:21`
    )
  ).toMatchSnapshot();
});

test('v30+', () => {
  expect(
    parse(
      `trace@file:///C:/example.html:9:17
b@file:///C:/example.html:16:13
a@file:///C:/example.html:19:13
@file:///C:/example.html:21:9`
    )
  ).toMatchSnapshot();
});
