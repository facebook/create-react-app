/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from 'chai';
import initDOM from './initDOM';

describe('Integration', () => {
  describe('Environment variables', () => {
    it('file env variables', async () => {
      const doc = await initDOM('file-env-variables');

      expect(
        doc.getElementById('feature-file-env-original-1').textContent
      ).to.equal('from-original-env-1');
      expect(
        doc.getElementById('feature-file-env-original-2').textContent
      ).to.equal('override-from-original-local-env-2');

      if (process.env.NODE_ENV === 'production') {
        expect(doc.getElementById('feature-file-env').textContent).to.equal(
          'production'
        );
        expect(doc.getElementById('feature-file-env-x').textContent).to.equal(
          'x-from-production-env'
        );
      } else {
        expect(doc.getElementById('feature-file-env').textContent).to.equal(
          'development'
        );
        expect(doc.getElementById('feature-file-env-x').textContent).to.equal(
          'x-from-development-env'
        );
      }
      doc.defaultView.close();
    });

    it('NODE_PATH', async () => {
      const doc = await initDOM('node-path');

      expect(
        doc.getElementById('feature-node-path').childElementCount
      ).to.equal(4);
      doc.defaultView.close();
    });

    it('PUBLIC_URL', async () => {
      const doc = await initDOM('public-url');

      const prefix =
        process.env.NODE_ENV === 'development'
          ? ''
          : 'http://www.example.org/spa';
      expect(doc.getElementById('feature-public-url').textContent).to.equal(
        `${prefix}.`
      );
      expect(
        doc.querySelector('head link[rel="shortcut icon"]').getAttribute('href')
      ).to.equal(`${prefix}/favicon.ico`);
      doc.defaultView.close();
    });

    it('shell env variables', async () => {
      const doc = await initDOM('shell-env-variables');

      expect(
        doc.getElementById('feature-shell-env-variables').textContent
      ).to.equal('fromtheshell.');
      doc.defaultView.close();
    });

    it('expand .env variables', async () => {
      const doc = await initDOM('expand-env-variables');

      expect(doc.getElementById('feature-expand-env-1').textContent).to.equal(
        'basic'
      );
      expect(doc.getElementById('feature-expand-env-2').textContent).to.equal(
        'basic'
      );
      expect(doc.getElementById('feature-expand-env-3').textContent).to.equal(
        'basic'
      );
      expect(
        doc.getElementById('feature-expand-env-existing').textContent
      ).to.equal('fromtheshell');
      doc.defaultView.close();
    });
  });
});
