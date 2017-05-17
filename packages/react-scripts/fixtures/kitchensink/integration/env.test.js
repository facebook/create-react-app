/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai'
import initDOM from './initDOM'

describe('Integration', () => {
  describe('Environment variables', () => {
    it('file env variables', async () => {
      const doc = await initDOM('file-env-variables')

      expect(doc.getElementById('feature-file-env-variables').textContent).to.equal('fromtheenvfile.')
    })

    it('NODE_PATH', async () => {
      const doc = await initDOM('node-path')

      expect(doc.getElementById('feature-node-path').childElementCount).to.equal(4)
    })

    it('PUBLIC_URL', async () => {
      const doc = await initDOM('public-url')

      const prefix = process.env.NODE_ENV === 'development' ? '' : 'http://www.example.org/spa';
      expect(doc.getElementById('feature-public-url').textContent).to.equal(`${prefix}.`)
      expect(doc.querySelector('head link[rel="shortcut icon"]').getAttribute('href'))
        .to.equal(`${prefix}/favicon.ico`)
    })

    it('shell env variables', async () => {
      const doc = await initDOM('shell-env-variables')

      expect(doc.getElementById('feature-shell-env-variables').textContent).to.equal('fromtheshell.')
    })
  })
})
