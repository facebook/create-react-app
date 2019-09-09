'use strict';

const path = require('path');

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process(src, filename) {
    const ext = filename.split('.').pop();
    const assetFilename = JSON.stringify(path.basename(filename));

    const mockedSrc = `${assetFilename}.${ext}`;
    const mockedSrcSet = `${assetFilename}.${ext}`;
    const mockedPlaceholder = true;

    return `module.exports = {
        __esModule: true,
        default: {
          src: ${mockedSrc},
          srcSet: ${mockedSrcSet},
          width: 100,
          height: 100,
          placeholder: ${mockedPlaceholder}
        },
      };`;
  },
};
