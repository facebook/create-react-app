'use strict';

module.exports = function(api) {
  api.cache(true);
  const presets = ['react-app'];

  return {
    presets,
  };
};
