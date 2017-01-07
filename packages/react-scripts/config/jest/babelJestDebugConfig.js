const babelJestDefaultConfig = require('./babelJestDefaultConfig');
const assign = require('object-assign');
module.exports = assign(babelJestDefaultConfig, { sourceMaps: true });
