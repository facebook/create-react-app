/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import initDOM from './initDOM';

describe('Integration', () => {
  describe('jsconfig.json/tsconfig.json', () => {
    let doc;

    afterEach(() => {
      doc && doc.defaultView.close();
      doc = undefined;
    });

    it('Supports setting baseUrl to src', async () => {
      doc = await initDOM('base-url');

      expect(doc.getElementById('feature-base-url').childElementCount).toBe(4);
    });
  });
});
