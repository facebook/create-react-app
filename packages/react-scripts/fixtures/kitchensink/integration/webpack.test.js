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

      // The expected pattern here is wrong. Due to:
      //
      //     https://github.com/webpack/loader-utils/pull/71
      //
      // ...the loader-utils module gets the interpolated name wrong when
      // there's no file extension and there's a period in source directory
      // path (which happens here due to generated temp directories). You
      // end up with something like:
      //
      //  /static/media/.cb7eb057.OEs6g9SsPz/test-kitchensink/src/features/webpack/assets/aFileWithoutExt
      //
      //  instead of:
      //
      //  /static/media/aFileWithoutExt.[hash].bin
      //
      // At some point loader-utils will be fixed, and the pattern can be
      // fixed too.
      expect(doc.getElementById('feature-no-ext-inclusion').href).to.match(/\/static\/media\/.*aFileWithoutExt$/)
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

      expect(doc.getElementById('feature-unknown-ext-inclusion').href).to.match(/\/static\/media\/aFileWithExt\.[a-f0-9]{8}\.unknown$/);
    })
  })
})
