/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import initDOM from './initDOM';

describe('Integration', () => {
  describe('Webpack plugins', () => {
    it('css inclusion', async () => {
      const doc = await initDOM('css-inclusion');

      expect(
        doc.getElementsByTagName('style')[0].textContent.replace(/\s/g, '')
      ).toMatch(/#feature-css-inclusion\{background:.+;color:.+}/);
    });

    it('image inclusion', async () => {
      const doc = await initDOM('image-inclusion');

      expect(doc.getElementById('feature-image-inclusion').src).toMatch(
        /^data:image\/jpeg;base64.+==$/
      );
    });

    it('no ext inclusion', async () => {
      const doc = await initDOM('no-ext-inclusion');

      expect(doc.getElementById('feature-no-ext-inclusion').href).toMatch(
        /\/static\/media\/aFileWithoutExt\.[a-f0-9]{8}\.bin$/
      );
    });

    it('json inclusion', async () => {
      const doc = await initDOM('json-inclusion');

      expect(doc.getElementById('feature-json-inclusion').textContent).toBe(
        'This is an abstract.'
      );
    });

    it('linked modules', async () => {
      const doc = await initDOM('linked-modules');

      expect(doc.getElementById('feature-linked-modules').textContent).toBe(
        '2.0.0'
      );
    });

    it('svg inclusion', async () => {
      const doc = await initDOM('svg-inclusion');

      expect(doc.getElementById('feature-svg-inclusion').src).toMatch(
        /\/static\/media\/logo\..+\.svg$/
      );
    });

    it('unknown ext inclusion', async () => {
      const doc = await initDOM('unknown-ext-inclusion');

      expect(doc.getElementById('feature-unknown-ext-inclusion').href).toMatch(
        /\/static\/media\/aFileWithExt\.[a-f0-9]{8}\.unknown$/
      );
    });
  });
});
