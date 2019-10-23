'use strict';
const path = require('path');

const baseConfig = require('./webpack.base.conf');

module.exports = {
  ...baseConfig,
  // add any configuration needed for production build here, and if it is common, please update it in
  // https://github.com/gzkiwiinc/create-react-app.git as well (under `react-scripts/template-typescript`)
};
