/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect } from 'chai';
import initDOM, { resourceLoader } from './initDOM';
import url from 'url';

describe('Integration', () => {
  describe('Webpack plugins', () => {
    it('css inclusion', async () => {
      const doc = await initDOM('css-inclusion');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[1].href) },
        (_, textContent) => {
          expect(textContent).to.match(/html\{/);
          expect(textContent).to.match(
            /#feature-css-inclusion\{background:.+;color:.+}/
          );
        }
      );
    });

    it('css modules inclusion', async () => {
      const doc = await initDOM('css-modules-inclusion');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[2].href) },
        (_, textContent) => {
          expect(textContent).to.match(
            /.+style_cssModulesInclusion__.+\{background:.+;color:.+}/
          );
          expect(textContent).to.match(
            /.+assets_cssModulesIndexInclusion__.+\{background:.+;color:.+}/
          );
        }
      );
    });

    it('scss inclusion', async () => {
      const doc = await initDOM('scss-inclusion');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[2].href) },
        (_, textContent) => {
          expect(textContent).to.match(
            /#feature-scss-inclusion\{background:.+;color:.+}/
          );
        }
      );
    });

    it('scss modules inclusion', async () => {
      const doc = await initDOM('scss-modules-inclusion');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[2].href) },
        (_, textContent) => {
          expect(textContent).to.match(
            /.+scss-styles_scssModulesInclusion.+\{background:.+;color:.+}/
          );
          expect(textContent).to.match(
            /.+assets_scssModulesIndexInclusion.+\{background:.+;color:.+}/
          );
        }
      );
    });

    it('sass inclusion', async () => {
      const doc = await initDOM('sass-inclusion');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[2].href) },
        (_, textContent) => {
          expect(textContent).to.match(
            /#feature-sass-inclusion\{background:.+;color:.+}/
          );
        }
      );
    });

    it('sass modules inclusion', async () => {
      const doc = await initDOM('sass-modules-inclusion');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[2].href) },
        (_, textContent) => {
          expect(textContent).to.match(
            /.+sass-styles_sassModulesInclusion.+\{background:.+;color:.+}/
          );
          expect(textContent).to.match(
            /.+assets_sassModulesIndexInclusion.+\{background:.+;color:.+}/
          );
        }
      );
    });

    it('graphql files inclusion', async () => {
      const doc = await initDOM('graphql-inclusion');
      const children = doc.getElementById('graphql-inclusion').children;

      // .graphql
      expect(children[0].textContent.replace(/\s/g, '')).to.equal(
        '{"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"test"},"value":{"kind":"StringValue","value":"test","block":false}}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"arguments":[],"directives":[]}]}}]}}],"loc":{"start":0,"end":40,"source":{"body":"{\\ntest(test:\\"test\\"){\\ntest\\n}\\n}\\n","name":"GraphQLrequest","locationOffset":{"line":1,"column":1}}}}'
      );
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

    it('svg component', async () => {
      const doc = await initDOM('svg-component');

      expect(doc.getElementById('feature-svg-component').textContent).to.equal(
        ''
      );
    });

    it('svg in css', async () => {
      const doc = await initDOM('svg-in-css');
      resourceLoader(
        { url: url.parse(doc.getElementsByTagName('link')[2].href) },
        (_, textContent) => {
          expect(textContent).to.match(/\/static\/media\/logo\..+\.svg/);
        }
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
