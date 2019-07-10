/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import initDOM from './initDOM';

describe('Integration', () => {
  describe('Language syntax', () => {
    let doc;

    afterEach(() => {
      doc && doc.defaultView.close();
      doc = undefined;
    });

    it('array destructuring', async () => {
      doc = await initDOM('array-destructuring');

      expect(
        doc.getElementById('feature-array-destructuring').childElementCount
      ).toBe(4);
    });

    it('array spread', async () => {
      doc = await initDOM('array-spread');

      expect(doc.getElementById('feature-array-spread').childElementCount).toBe(
        4
      );
    });

    it('async/await', async () => {
      doc = await initDOM('async-await');

      expect(doc.getElementById('feature-async-await').childElementCount).toBe(
        4
      );
    });

    it('class properties', async () => {
      doc = await initDOM('class-properties');

      expect(
        doc.getElementById('feature-class-properties').childElementCount
      ).toBe(4);
    });

    it('computed properties', async () => {
      doc = await initDOM('computed-properties');

      expect(
        doc.getElementById('feature-computed-properties').childElementCount
      ).toBe(4);
    });

    it('custom interpolation', async () => {
      doc = await initDOM('custom-interpolation');

      expect(
        doc.getElementById('feature-custom-interpolation').childElementCount
      ).toBe(4);
    });

    it('default parameters', async () => {
      doc = await initDOM('default-parameters');

      expect(
        doc.getElementById('feature-default-parameters').childElementCount
      ).toBe(4);
    });

    it('destructuring and await', async () => {
      doc = await initDOM('destructuring-and-await');

      expect(
        doc.getElementById('feature-destructuring-and-await').childElementCount
      ).toBe(4);
    });

    it('generators', async () => {
      doc = await initDOM('generators');

      expect(doc.getElementById('feature-generators').childElementCount).toBe(
        4
      );
    });

    it('object destructuring', async () => {
      doc = await initDOM('object-destructuring');

      expect(
        doc.getElementById('feature-object-destructuring').childElementCount
      ).toBe(4);
    });

    it('object spread', async () => {
      doc = await initDOM('object-spread');

      expect(
        doc.getElementById('feature-object-spread').childElementCount
      ).toBe(4);
    });

    it('promises', async () => {
      doc = await initDOM('promises');

      expect(doc.getElementById('feature-promises').childElementCount).toBe(4);
    });

    it('rest + default', async () => {
      doc = await initDOM('rest-and-default');

      expect(
        doc.getElementById('feature-rest-and-default').childElementCount
      ).toBe(4);
    });

    it('rest parameters', async () => {
      doc = await initDOM('rest-parameters');

      expect(
        doc.getElementById('feature-rest-parameters').childElementCount
      ).toBe(4);
    });

    it('template interpolation', async () => {
      doc = await initDOM('template-interpolation');

      expect(
        doc.getElementById('feature-template-interpolation').childElementCount
      ).toBe(4);
    });
  });
});
