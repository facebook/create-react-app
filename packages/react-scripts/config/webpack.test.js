'use strict';

const webpackConfig = require('./webpack.config');
const webpackChainConfig = require('./webpackChain.config');

it('match the original config', () => {
  const originalConfig = webpackConfig('development');
  const newConfig = webpackChainConfig('development');
  expect(originalConfig).toEqual(newConfig);
});
