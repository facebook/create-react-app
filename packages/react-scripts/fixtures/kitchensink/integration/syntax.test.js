/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from 'chai';
import initDOM from './initDOM';

describe('Integration', () => {
  describe('Language syntax', () => {
    it('array destructuring', async () => {
      const doc = await initDOM('array-destructuring');

      expect(
        doc.getElementById('feature-array-destructuring').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('array spread', async () => {
      const doc = await initDOM('array-spread');

      expect(
        doc.getElementById('feature-array-spread').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('async/await', async () => {
      const doc = await initDOM('async-await');

      expect(
        doc.getElementById('feature-async-await').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('class properties', async () => {
      const doc = await initDOM('class-properties');

      expect(
        doc.getElementById('feature-class-properties').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('computed properties', async () => {
      const doc = await initDOM('computed-properties');

      expect(
        doc.getElementById('feature-computed-properties').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('custom interpolation', async () => {
      const doc = await initDOM('custom-interpolation');

      expect(
        doc.getElementById('feature-custom-interpolation').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('default parameters', async () => {
      const doc = await initDOM('default-parameters');

      expect(
        doc.getElementById('feature-default-parameters').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('destructuring and await', async () => {
      const doc = await initDOM('destructuring-and-await');

      expect(
        doc.getElementById('feature-destructuring-and-await').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('generators', async () => {
      const doc = await initDOM('generators');

      expect(
        doc.getElementById('feature-generators').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('object destructuring', async () => {
      const doc = await initDOM('object-destructuring');

      expect(
        doc.getElementById('feature-object-destructuring').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('object spread', async () => {
      const doc = await initDOM('object-spread');

      expect(
        doc.getElementById('feature-object-spread').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('promises', async () => {
      const doc = await initDOM('promises');

      expect(doc.getElementById('feature-promises').childElementCount).to.equal(
        4
      );
      doc.defaultView.close();
    });

    it('rest + default', async () => {
      const doc = await initDOM('rest-and-default');

      expect(
        doc.getElementById('feature-rest-and-default').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('rest parameters', async () => {
      const doc = await initDOM('rest-parameters');

      expect(
        doc.getElementById('feature-rest-parameters').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('template interpolation', async () => {
      const doc = await initDOM('template-interpolation');

      expect(
        doc.getElementById('feature-template-interpolation').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });
  });
});
