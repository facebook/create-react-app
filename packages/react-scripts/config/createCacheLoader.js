'use strict';

const path = require('path');
module.exports = function(hash, paths) {
  console.log(hash);
  process.exit();
  return {
    loader: require.resolve('cache-loader'),
    options: {
      cacheDirectory: path.join(
        paths.appNodeModules,
        '.cache',
        'cache-loader',
        hash
      ),
    },
  };
};
