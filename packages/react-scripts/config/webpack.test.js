'use strict';

const webpackConfig = require('./webpack.config');
const webpackChainConfig = require('./webpackChain.config');

it('match the original config', () => {
  const originalConfig = webpackConfig('production');
  const newConfig = webpackChainConfig('production');
  expect(originalConfig).toEqual(newConfig);
});
