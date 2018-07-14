/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from 'chai';
import initDOM, { resourceLoader } from './initDOM';
import url from 'url';

const matchCSS = (doc, regexes) => {
  if (process.env.E2E_FILE) {
    const elements = doc.getElementsByTagName('link');
    let href = '';
    for (const elem of elements) {
      if (elem.rel === 'stylesheet') {
        href = elem.href;
      }
    }
    resourceLoader({ url: url.parse(href) }, (_, textContent) => {
      for (const regex of regexes) {
        expect(textContent).to.match(regex);
      }
    });
  } else {
    for (let i = 0; i < regexes.length; ++i) {
      expect(
        doc.getElementsByTagName('style')[i].textContent.replace(/\s/g, '')
      ).to.match(regexes[i]);
    }
  }
};

describe('Integration', () => {
  describe('Webpack plugins', () => {
    it('css inclusion', async () => {
      const doc = await initDOM('css-inclusion');
      matchCSS(doc, [
        /html\{/,
        /#feature-css-inclusion\{background:.+;color:.+}/,
      ]);
      doc.defaultView.close();
    });

    it('css modules inclusion', async () => {
      const doc = await initDOM('css-modules-inclusion');
      matchCSS(doc, [
        /.+style_cssModulesInclusion__.+\{background:.+;color:.+}/,
        /.+assets_cssModulesIndexInclusion__.+\{background:.+;color:.+}/,
      ]);
      doc.defaultView.close();
    });

    it('scss inclusion', async () => {
      const doc = await initDOM('scss-inclusion');
      matchCSS(doc, [/#feature-scss-inclusion\{background:.+;color:.+}/]);
      doc.defaultView.close();
    });

    it('scss modules inclusion', async () => {
      const doc = await initDOM('scss-modules-inclusion');
      matchCSS(doc, [
        /.+scss-styles_scssModulesInclusion.+\{background:.+;color:.+}/,
        /.+assets_scssModulesIndexInclusion.+\{background:.+;color:.+}/,
      ]);
      doc.defaultView.close();
    });

    it('sass inclusion', async () => {
      const doc = await initDOM('sass-inclusion');
      matchCSS(doc, [/#feature-sass-inclusion\{background:.+;color:.+}/]);
      doc.defaultView.close();
    });

    it('sass modules inclusion', async () => {
      const doc = await initDOM('sass-modules-inclusion');
      matchCSS(doc, [
        /.+sass-styles_sassModulesInclusion.+\{background:.+;color:.+}/,
        /.+assets_sassModulesIndexInclusion.+\{background:.+;color:.+}/,
      ]);
      doc.defaultView.close();
    });

    it('graphql files inclusion', async () => {
      const doc = await initDOM('graphql-inclusion');
      const children = doc.getElementById('graphql-inclusion').children;

      // .graphql
      expect(children[0].textContent.replace(/\s/g, '')).to.equal(
        '{"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"test"},"value":{"kind":"StringValue","value":"test","block":false}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"arguments":[],"directives":[]}]}}]}}],"loc":{"start":0,"end":40,"source":{"body":"{\\ntest(test:\\"test\\"){\\ntest\\n}\\n}\\n","name":"GraphQLrequest","locationOffset":{"line":1,"column":1}}}}'
      );
      doc.defaultView.close();
    });

    it('image inclusion', async () => {
      const doc = await initDOM('image-inclusion');

      expect(doc.getElementById('feature-image-inclusion').src).to.match(
        /^data:image\/jpeg;base64.+==$/
      );
      doc.defaultView.close();
    });

    it('no ext inclusion', async () => {
      const doc = await initDOM('no-ext-inclusion');

      expect(doc.getElementById('feature-no-ext-inclusion').href).to.match(
        /\/static\/media\/aFileWithoutExt\.[a-f0-9]{8}\.bin$/
      );
      doc.defaultView.close();
    });

    it('json inclusion', async () => {
      const doc = await initDOM('json-inclusion');

      expect(doc.getElementById('feature-json-inclusion').textContent).to.equal(
        'This is an abstract.'
      );
      doc.defaultView.close();
    });

    it('linked modules', async () => {
      const doc = await initDOM('linked-modules');

      expect(doc.getElementById('feature-linked-modules').textContent).to.equal(
        '2.0.0'
      );
      doc.defaultView.close();
    });

    it('svg inclusion', async () => {
      const doc = await initDOM('svg-inclusion');
      expect(doc.getElementById('feature-svg-inclusion').src).to.match(
        /\/static\/media\/logo\..+\.svg$/
      );
      doc.defaultView.close();
    });

    it('svg component', async () => {
      const doc = await initDOM('svg-component');

      expect(doc.getElementById('feature-svg-component').textContent).to.equal(
        ''
      );
      doc.defaultView.close();
    });

    it('svg in css', async () => {
      const doc = await initDOM('svg-in-css');
      matchCSS(doc, [/\/static\/media\/logo\..+\.svg/]);
      doc.defaultView.close();
    });

    it('unknown ext inclusion', async () => {
      const doc = await initDOM('unknown-ext-inclusion');

      expect(doc.getElementById('feature-unknown-ext-inclusion').href).to.match(
        /\/static\/media\/aFileWithExt\.[a-f0-9]{8}\.unknown$/
      );
      doc.defaultView.close();
    });
  });
});
