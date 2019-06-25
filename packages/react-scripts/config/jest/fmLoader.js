'use strict';

const matter = require('gray-matter');
const stringifyObject = require('stringify-object');
const mdx = require("@mdx-js/mdx");
const babel = require("babel-core");

function createTransformer(callback) {
  return function(src) {
    let rawMDX = src;

    if (callback) {
      rawMDX = callback(rawMDX);
    }

    // Convert .MDX file into JSX
    var rawJSX = mdx.sync(rawMDX);

    // Inject React and MDXTag imports
    var injectedJSX =
      "import React from 'react'; import MDXTag from '@mdx-js/tag/dist/mdx-tag';" +
      rawJSX;

    // Transform ES6 with babel
    var babelRes = babel.transform(injectedJSX, {
      presets: [require.resolve('babel-preset-react-app')],
      babelrc: false,
      configFile: false,
      plugins: [
        'babel-plugin-import-remove-resource-query',
        'require-context-hook',
      ]
    }).code;

    return babelRes;
  };
};

function preMdxParseCallback(src) {
  const { content, data } = matter(src);

  const code = `export const frontMatter = ${stringifyObject(data)}

  ${content}`;

  return code;
}

module.exports = {
  process: createTransformer(preMdxParseCallback),
};
