'use strict';

const matter = require('gray-matter');
const stringifyObject = require('stringify-object');
const loaderUtils = require('loader-utils');

module.exports = async function(src) {
  const callback = this.async();
  const { content, data } = matter(src);

  const resourceQuery = this.resourceQuery
    ? loaderUtils.parseQuery(this.resourceQuery)
    : {};

  let code;
  if (resourceQuery.frontMatter === 'only') {
    code = `export const frontMatter = ${stringifyObject(data)}`;
  } else if (resourceQuery.frontMatter === 'omit') {
    code = content;
  } else {
    code = `export const frontMatter = ${stringifyObject(data)}

    ${content}`;
  }

  return callback(null, code);
};
