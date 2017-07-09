'use strict';

const {
  pushExtensions,
  pushExclusiveLoader,
} = require('react-dev-utils/plugins');

function apply(config, { paths }) {
  pushExtensions(config, [['.js', '.tsx', '.ts']]);
  pushExclusiveLoader(config, '/\\.(js|jsx)$/', {
    test: /\.(ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('awesome-typescript-loader'),
    options: {
      silent: true,
      configFileName: require.resolve('tsconfig-react-app'),
    },
  });
  return config;
}

module.exports = { apply };
