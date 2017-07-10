'use strict';

const {
  pushExtensions,
  pushExclusiveLoader,
} = require('react-dev-utils/plugins');

function apply(config, { paths }) {
  pushExtensions({ config }, [['.js', '.tsx', '.ts']]);
  pushExclusiveLoader({ config }, '/\\.(js|jsx)$/', {
    // Process TypeScript with `at-loader`
    test: /\.(ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('awesome-typescript-loader'),
    options: {
      silent: true,
      // @remove-on-eject-begin
      configFileName: require.resolve('tsconfig-react-app'),
      // @remove-on-eject-end
    },
  });
  return config;
}

module.exports = { apply };
