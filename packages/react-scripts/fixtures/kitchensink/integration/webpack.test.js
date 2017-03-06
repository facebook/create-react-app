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
  describe('Webpack plugins', () => {
    it('css inclusion', async () => {
      const doc = await initDOM('css-inclusion')

      expect(doc.getElementsByTagName('style')[0].textContent.replace(/\s/g, ''))
        .to.match(/#feature-css-inclusion\{background:.+;color:.+}/)
    })

    it('image inclusion', async () => {
      const doc = await initDOM('image-inclusion')

      expect(doc.getElementById('feature-image-inclusion').src).to.match(/^data:image\/jpeg;base64.+==$/)
    })

    it('no ext inclusion', async () => {
      const doc = await initDOM('no-ext-inclusion')

      expect(doc.getElementById('feature-no-ext-inclusion').textContent)
        .to.equal('This is just a file without an extension.')
    })

    it('json inclusion', async () => {
      const doc = await initDOM('json-inclusion')

      expect(doc.getElementById('feature-json-inclusion').textContent).to.equal('This is an abstract.')
    })

    it('svg inclusion', async () => {
      const doc = await initDOM('svg-inclusion')

      expect(doc.getElementById('feature-svg-inclusion').src).to.match(/\/static\/media\/logo\..+\.svg$/)
    })

    it('unknown ext inclusion', async () => {
      const doc = await initDOM('unknown-ext-inclusion')

      expect(doc.getElementById('feature-unknown-ext-inclusion').textContent).to.equal('Whoooo, spooky!.')
    })
  })
})
