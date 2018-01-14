/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { map } from '../utils/mapper';
import { parse } from '../utils/parser';
import fs from 'fs';
import { resolve } from 'path';

test('basic error; 0 context', async () => {
  expect.assertions(1);
  const error = 'TypeError: document.body.missing is not a function\n    at App.componentDidMount (http://localhost:3000/static/js/bundle.js:26122:21)\n    at http://localhost:3000/static/js/bundle.js:30091:25\n    at measureLifeCyclePerf (http://localhost:3000/static/js/bundle.js:29901:12)\n    at http://localhost:3000/static/js/bundle.js:30090:11\n    at CallbackQueue.notifyAll (http://localhost:3000/static/js/bundle.js:13256:22)\n    at ReactReconcileTransaction.close (http://localhost:3000/static/js/bundle.js:35124:26)\n    at ReactReconcileTransaction.closeAll (http://localhost:3000/static/js/bundle.js:7390:25)\n    at ReactReconcileTransaction.perform (http://localhost:3000/static/js/bundle.js:7337:16)\n    at batchedMountComponentIntoNode (http://localhost:3000/static/js/bundle.js:14204:15)\n    at ReactDefaultBatchingStrategyTransaction.perform (http://localhost:3000/static/js/bundle.js:7324:20)\n    at Object.batchedUpdates (http://localhost:3000/static/js/bundle.js:33900:26)\n    at Object.batchedUpdates (http://localhost:3000/static/js/bundle.js:2181:27)\n    at Object._renderNewRootComponent (http://localhost:3000/static/js/bundle.js:14398:18)\n    at Object._renderSubtreeIntoContainer (http://localhost:3000/static/js/bundle.js:14479:32)\n    at Object.render (http://localhost:3000/static/js/bundle.js:14500:23)\n    at Object.friendlySyntaxErrorLabel (http://localhost:3000/static/js/bundle.js:17287:20)\n    at __webpack_require__ (http://localhost:3000/static/js/bundle.js:660:30)\n    at fn (http://localhost:3000/static/js/bundle.js:84:20)\n    at Object.<anonymous> (http://localhost:3000/static/js/bundle.js:41219:18)\n    at __webpack_require__ (http://localhost:3000/static/js/bundle.js:660:30)\n    at validateFormat (http://localhost:3000/static/js/bundle.js:709:39)\n    at http://localhost:3000/static/js/bundle.js:712:10';

  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs'))
      .toString('utf8')
  );
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs.map'))
      .toString('utf8')
  );
  const frames = await map(parse(error), 0);
  expect(frames).toEqual(
    JSON.parse(
      fs
        .readFileSync(resolve(__dirname, '../../fixtures/bundle.json'))
        .toString('utf8')
    )
  );
});

test('default context (3)', async () => {
  expect.assertions(1);
  const error = 'TypeError: document.body.missing is not a function\n    at App.componentDidMount (http://localhost:3000/static/js/bundle.js:26122:21)';

  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs'))
      .toString('utf8')
  );
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs.map'))
      .toString('utf8')
  );
  const frames = await map(parse(error));
  expect(frames).toEqual(
    JSON.parse(
      fs
        .readFileSync(resolve(__dirname, '../../fixtures/bundle-default.json'))
        .toString('utf8')
    )
  );
});

test('bad comes back same', async () => {
  expect.assertions(2);
  const error = 'TypeError: document.body.missing is not a function\n    at App.componentDidMount (A:1:2)';
  const orig = parse(error);
  expect(orig).toEqual([
    {
      _originalColumnNumber: null,
      _originalFileName: null,
      _originalFunctionName: null,
      _originalLineNumber: null,
      _originalScriptCode: null,
      _scriptCode: null,
      columnNumber: 2,
      fileName: 'A',
      functionName: 'App.componentDidMount',
      lineNumber: 1,
    },
  ]);
  const frames = await map(orig);
  expect(frames).toEqual(orig);
});
