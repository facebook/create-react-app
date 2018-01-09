/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from 'chai';
import initDOM from './initDOM';

describe('Integration', () => {
  describe('Webpack plugins', () => {
    it('css inclusion', async () => {
      const doc = await initDOM('css-inclusion');

      expect(
        doc.getElementsByTagName('style')[0].textContent.replace(/\s/g, '')
      ).to.match(/html\{/);
      expect(
        doc.getElementsByTagName('style')[1].textContent.replace(/\s/g, '')
      ).to.match(/#feature-css-inclusion\{background:.+;color:.+}/);
    });

    it('image inclusion', async () => {
      const doc = await initDOM('image-inclusion');

      expect(doc.getElementById('feature-image-inclusion').src).to.match(
        /^data:image\/jpeg;base64.+==$/
      );
    });

    it('no ext inclusion', async () => {
      const doc = await initDOM('no-ext-inclusion');

      expect(doc.getElementById('feature-no-ext-inclusion').href).to.match(
        /\/static\/media\/aFileWithoutExt\.[a-f0-9]{8}\.bin$/
      );
    });

    it('json inclusion', async () => {
      const doc = await initDOM('json-inclusion');

      expect(doc.getElementById('feature-json-inclusion').textContent).to.equal(
        'This is an abstract.'
      );
    });

    it('linked modules', async () => {
      const doc = await initDOM('linked-modules');

      expect(doc.getElementById('feature-linked-modules').textContent).to.equal(
        '2.0.0'
      );
    });

    it('svg inclusion', async () => {
      const doc = await initDOM('svg-inclusion');

      expect(doc.getElementById('feature-svg-inclusion').src).to.match(
        /\/static\/media\/logo\..+\.svg$/
      );
    });

    it('unknown ext inclusion', async () => {
      const doc = await initDOM('unknown-ext-inclusion');

      expect(doc.getElementById('feature-unknown-ext-inclusion').href).to.match(
        /\/static\/media\/aFileWithExt\.[a-f0-9]{8}\.unknown$/
      );
    });
  });
});
