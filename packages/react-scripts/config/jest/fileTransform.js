'use strict';

const path = require('path');
const camelcase = require('camelcase');

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process(src, filename) {
    const assetFilename = path.basename(filename);
    const assetFilenameParsed = JSON.stringify(assetFilename);

    if (filename.match(/\.svg$/)) {
      // Based on how SVGR generates a component name:
      // https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6
      const pascalCaseFilename = camelcase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = `Svg${pascalCaseFilename}`;
      return `
        const React = require('react');
        module.exports = {
          __esModule: true,
          default: ${assetFilenameParsed},
          ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
            return {
              $$typeof: Symbol.for('react.element'),
              type: 'svg',
              ref: ref,
              key: null,
              props: Object.assign({}, props, {
                children: ${assetFilenameParsed}
              })
            };
          }),
        };
      `;
    }

    if (filename.match(/\.(png|webp|jpg|jpeg)$/)) {
      const mockedSrc = assetFilename;
      const mockedSrcSet = `${assetFilename} w200`;
      const mockedPlaceholder = true;

      return `
        module.exports = {
          __esModule: true,
          default: {
            src: ${JSON.stringify(mockedSrc)},
            srcSet: ${JSON.stringify(mockedSrcSet)},
            width: 100,
            height: 100,
            placeholder: ${mockedPlaceholder}
          },
        };
      `;
    }

    return `module.exports = ${assetFilenameParsed};`;
  },
};
