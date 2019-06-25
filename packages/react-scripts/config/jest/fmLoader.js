'use strict';

const matter = require('gray-matter');
const stringifyObject = require('stringify-object');
const createTransformer = require('jest-mdx-loader/src/createTransformer');

function preMdxParseCallback(src) {
  const { content, data } = matter(src);

  const code = `export const frontMatter = ${stringifyObject(data)}

  ${content}`;

  return code;
}

module.exports = {
  process: createTransformer(preMdxParseCallback),
};
