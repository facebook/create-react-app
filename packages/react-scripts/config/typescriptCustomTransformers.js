//@ts-check
'use strict';

const styledComponentsTransformer = require('typescript-plugin-styled-components')
  .default;
const tsTransformAsyncToMobxFlow = require('ts-transform-async-to-mobx-flow')
  .default;

module.exports = function() {
  return {
    before: [tsTransformAsyncToMobxFlow(), styledComponentsTransformer()]
  };
};
