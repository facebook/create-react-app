//@ts-check
'use strict';

const tsTransformAsyncToMobxFlow = require('ts-transform-async-to-mobx-flow')
  .default;

module.exports = function() {
  return {
    before: [tsTransformAsyncToMobxFlow()],
  };
};
