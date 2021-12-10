/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import initDOM from './initDOM';

describe('Integration', () => {
  describe('Environment variables', () => {
    let doc;

    afterEach(() => {
      doc && doc.defaultView.close();
      doc = undefined;
    });

    it('file env variables', async () => {
      doc = await initDOM('file-env-variables');

      expect(
        doc.getElementById('feature-file-env-original-1').textContent
      ).toBe('from-original-env-1');
      expect(
        doc.getElementById('feature-file-env-original-2').textContent
      ).toBe('override-from-original-local-env-2');

      expect(doc.getElementById('feature-file-env').textContent).toBe(
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
      );
      expect(doc.getElementById('feature-file-env-x').textContent).toBe(
        'x-from-original-local-env'
      );
    });

    it('PUBLIC_URL', async () => {
      doc = await initDOM('public-url');

      const prefix =
        process.env.NODE_ENV === 'development'
          ? ''
          : 'http://www.example.org/spa';
      expect(doc.getElementById('feature-public-url').textContent).toBe(
        `${prefix}.`
      );
      expect(
        doc.querySelector('head link[rel="icon"]').getAttribute('href')
      ).toBe(`${prefix}/favicon.ico`);
    });

    it('shell env variables', async () => {
      doc = await initDOM('shell-env-variables');

      expect(
        doc.getElementById('feature-shell-env-variables').textContent
      ).toBe('fromtheshell.');
    });

    it('expand .env variables', async () => {
      doc = await initDOM('expand-env-variables');

      expect(doc.getElementById('feature-expand-env-1').textContent).toBe(
        'basic'
      );
      expect(doc.getElementById('feature-expand-env-2').textContent).toBe(
        'basic'
      );
      expect(doc.getElementById('feature-expand-env-3').textContent).toBe(
        'basic'
      );
      expect(
        doc.getElementById('feature-expand-env-existing').textContent
      ).toBe('fromtheshell');
    });
  });
});
