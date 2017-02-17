var overrideConfig = function(config) {
  return config;
};

// @remove-on-eject-begin
var path = require('path');
var overrideConfigPath = path.resolve(process.cwd(), 'config/webpack.config.dev.override.js');
overrideConfig = require(overrideConfigPath);
// @remove-on-eject-end

module.exports = function devConfigOverride(config) {
  return overrideConfig(config);
};
