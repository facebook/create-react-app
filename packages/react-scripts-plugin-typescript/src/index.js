'use strict';

const {
  pushExtensions,
  pushExclusiveLoader,
} = require('react-dev-utils/plugins');

function apply(config, { path, paths }) {
  pushExtensions({ config }, [['.js', '.tsx', '.ts']]);
  pushExclusiveLoader({ config }, '/\\.(js|jsx)$/', {
    // Process TypeScript with `at-loader`
    test: /\.(ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('awesome-typescript-loader'),
    options: {
      silent: true,
      forceConsistentCasingInFileNames: true,
      module: 'esnext',
      moduleResolution: 'node',
      downlevelIteration: true,
      sourceMap: true,
      target: 'es5',
      // @remove-on-eject-begin
      configFileName: path.join(paths.appSrc, 'tsconfig.json'),
      // @remove-on-eject-end
    },
  });
  return config;
}

function eject() {
  // TODO: remove defaults above and inject into their file
}

module.exports = { apply, eject, tsc: require('typescript') };
